package com.sevakendra.app.util

import android.content.ActivityNotFoundException
import android.content.ClipData
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns
import android.widget.Toast
import androidx.core.content.FileProvider
import com.sevakendra.app.data.ShopConfig
import java.io.File

object Actions {

    /** Sirf text message WhatsApp par dukaan ke number par bhejo. */
    fun whatsAppText(ctx: Context, text: String) {
        val url = "https://wa.me/${ShopConfig.OWNER_WHATSAPP}?text=" + Uri.encode(text)
        open(ctx, Intent(Intent.ACTION_VIEW, Uri.parse(url)), "WhatsApp nahi mila")
    }

    /**
     * Message + documents (photo / PDF) WhatsApp par bhejo.
     * Agar WhatsApp nahi hai to share menu khulega.
     */
    fun whatsAppWithFiles(ctx: Context, text: String, files: List<Uri>) {
        if (files.isEmpty()) {
            whatsAppText(ctx, text); return
        }
        val intent = Intent(Intent.ACTION_SEND_MULTIPLE).apply {
            type = "*/*"
            putExtra(Intent.EXTRA_TEXT, text)
            putParcelableArrayListExtra(Intent.EXTRA_STREAM, ArrayList(files))
            putExtra("jid", "${ShopConfig.OWNER_WHATSAPP}@s.whatsapp.net")
            val clip = ClipData.newRawUri("docs", files.first())
            files.drop(1).forEach { clip.addItem(ClipData.Item(it)) }
            clipData = clip
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        for (pkg in listOf("com.whatsapp", "com.whatsapp.w4b")) {
            try {
                ctx.startActivity(Intent(intent).setPackage(pkg)); return
            } catch (_: ActivityNotFoundException) { }
        }
        open(ctx, Intent.createChooser(intent, "Documents bhejein"), "Share nahi ho paya")
    }

    /** UPI app (GPay / PhonePe / Paytm) kholo, amount pehle se bhara hoga. */
    fun payUpi(ctx: Context, amount: Int, note: String) {
        val uri = Uri.Builder().scheme("upi").authority("pay")
            .appendQueryParameter("pa", ShopConfig.UPI_ID)
            .appendQueryParameter("pn", ShopConfig.UPI_NAME)
            .appendQueryParameter("am", "$amount.00")
            .appendQueryParameter("cu", "INR")
            .appendQueryParameter("tn", note)
            .build()
        open(ctx, Intent.createChooser(Intent(Intent.ACTION_VIEW, uri), "UPI app chunein"), "Koi UPI app nahi mila")
    }

    fun call(ctx: Context) =
        open(ctx, Intent(Intent.ACTION_DIAL, Uri.parse("tel:${ShopConfig.OWNER_CALL}")), "Call nahi ho paya")

    fun map(ctx: Context) =
        open(ctx, Intent(Intent.ACTION_VIEW, Uri.parse("geo:0,0?q=" + Uri.encode(ShopConfig.ADDRESS))), "Map nahi mila")

    /**
     * Chuni gayi file ko app ki apni cache mein copy karta hai, taaki
     * WhatsApp ko bhejte waqt permission ki problem na aaye.
     */
    fun copyToCache(ctx: Context, source: Uri, label: String): Uri? = try {
        val ext = displayName(ctx, source)?.substringAfterLast('.', "")?.takeIf { it.isNotBlank() }
            ?: if (ctx.contentResolver.getType(source)?.contains("pdf") == true) "pdf" else "jpg"
        val dir = File(ctx.cacheDir, "docs").apply { mkdirs() }
        val safe = label.replace(Regex("[^A-Za-z0-9]+"), "_").trim('_')
        val out = File(dir, "${safe}_${System.currentTimeMillis()}.$ext")
        ctx.contentResolver.openInputStream(source)?.use { input ->
            out.outputStream().use { input.copyTo(it) }
        }
        FileProvider.getUriForFile(ctx, "${ctx.packageName}.files", out)
    } catch (e: Exception) {
        Toast.makeText(ctx, "File nahi khul payi", Toast.LENGTH_SHORT).show(); null
    }

    private fun displayName(ctx: Context, uri: Uri): String? =
        ctx.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use {
            if (it.moveToFirst()) it.getString(0) else null
        }

    private fun open(ctx: Context, intent: Intent, error: String) {
        try {
            ctx.startActivity(intent)
        } catch (_: ActivityNotFoundException) {
            Toast.makeText(ctx, error, Toast.LENGTH_SHORT).show()
        }
    }
}

package com.sevakendra.app.ui

import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sevakendra.app.data.Application
import com.sevakendra.app.data.ShopConfig
import com.sevakendra.app.data.Store
import com.sevakendra.app.util.Actions
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun ServiceScreen(store: Store, serviceId: String, onBack: () -> Unit, onDone: () -> Unit) {
    val ctx = LocalContext.current
    val service = ShopConfig.services.firstOrNull { it.id == serviceId }
    if (service == null) { Text("Service nahi mili", Modifier.padding(24.dp)); return }

    var variant by remember { mutableIntStateOf(0) }
    var name by remember { mutableStateOf(store.name) }
    var mobile by remember { mutableStateOf(store.mobile) }
    var note by remember { mutableStateOf("") }
    val uploaded = remember { mutableStateMapOf<String, Uri>() }   // doc name -> file
    var pickingFor by remember { mutableStateOf<String?>(null) }

    val picker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        val docName = pickingFor
        if (uri != null && docName != null) {
            Actions.copyToCache(ctx, uri, docName)?.let { uploaded[docName] = it }
        }
        pickingFor = null
    }

    Column(Modifier.fillMaxSize()) {
        ScreenHeader("${service.emoji} ${service.name}", onBack)
        Column(Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(horizontal = 16.dp)) {

            Card {
                Column {
                    Text("Kaunsa kaam chahiye?", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Spacer(Modifier.height(8.dp))
                    Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        service.variants.forEachIndexed { i, v -> Choice(v, i == variant) { variant = i } }
                    }
                }
            }
            Spacer(Modifier.height(10.dp))

            Card {
                Column {
                    Text("📎 Documents ki photo / PDF lagayein", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text("Photo saaf aur poori dikhni chahiye", fontSize = 11.sp, color = Faint)
                    service.docs.forEachIndexed { i, d ->
                        if (i > 0) HorizontalDivider(color = Color0)
                        Row(
                            Modifier.fillMaxWidth().clickable {
                                pickingFor = d.name
                                picker.launch(arrayOf("image/*", "application/pdf"))
                            }.padding(vertical = 9.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Text(d.emoji, fontSize = 18.sp)
                            Spacer(Modifier.width(10.dp))
                            Text(d.name, fontSize = 13.sp, modifier = Modifier.weight(1f))
                            if (uploaded.containsKey(d.name)) Tag("✓ Lag gaya", Green, GreenLight)
                            else Tag("Upload", Blue, BlueLight)
                        }
                    }
                }
            }
            Spacer(Modifier.height(10.dp))

            Card {
                Column {
                    Text("👤 Aapki jaankari", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    OutlinedTextField(name, { name = it }, label = { Text("Poora naam") },
                        singleLine = true, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(mobile, { if (it.length <= 10) mobile = it.filter(Char::isDigit) },
                        label = { Text("Mobile number") }, singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(note, { note = it }, label = { Text("Kuch aur batana hai? (optional)") },
                        modifier = Modifier.fillMaxWidth())
                }
            }
            Spacer(Modifier.height(10.dp))

            Card {
                Column {
                    Text("💳 Fees", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    FeeRow("Sarkari fees", service.govtFee)
                    FeeRow("Seva charge", service.serviceCharge)
                    HorizontalDivider(Modifier.padding(vertical = 6.dp), color = Line)
                    FeeRow("Total", service.total, bold = true)
                    Text("⏱ ${service.days}", fontSize = 11.sp, color = Faint, modifier = Modifier.padding(top = 4.dp))
                }
            }
            Spacer(Modifier.height(12.dp))
        }

        Column(Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
            val ready = name.isNotBlank() && mobile.length == 10
            if (service.total > 0) {
                BigButton("💳 UPI se ₹${service.total} Pay karo", color = Saffron) {
                    Actions.payUpi(ctx, service.total, "${service.name} - $name")
                }
            }
            BigButton("📤 WhatsApp par Form Bhejo", enabled = ready) {
                val missing = service.docs.map { it.name }.filterNot { uploaded.containsKey(it) }
                if (uploaded.isEmpty()) {
                    Toast.makeText(ctx, "Kam se kam ek document lagayein", Toast.LENGTH_SHORT).show()
                    return@BigButton
                }
                store.saveProfile(name, mobile, store.address)
                val id = store.nextApplicationId()
                val date = SimpleDateFormat("dd MMM yyyy", Locale("en", "IN")).format(Date())
                val msg = buildString {
                    appendLine("🆕 *Naya Form* — $id")
                    appendLine("📋 Kaam: ${service.name} (${service.variants[variant]})")
                    appendLine("👤 Naam: $name")
                    appendLine("📞 Mobile: $mobile")
                    appendLine("📅 Date: $date")
                    appendLine("💰 Fees: ₹${service.total}")
                    appendLine("📎 Documents: ${uploaded.keys.joinToString()}")
                    if (missing.isNotEmpty()) appendLine("⚠️ Baaki documents: ${missing.joinToString()}")
                    if (note.isNotBlank()) appendLine("📝 Note: $note")
                }
                store.addApplication(
                    Application(id, service.name, service.emoji, service.variants[variant],
                        System.currentTimeMillis(), service.total, "Bheja gaya")
                )
                Actions.whatsAppWithFiles(ctx, msg, uploaded.values.toList())
                onDone()
            }
            if (!ready) Text("Naam aur 10 digit mobile number bharein", fontSize = 11.sp, color = Faint,
                modifier = Modifier.align(Alignment.CenterHorizontally))
        }
    }
}

private val Color0 = Line.copy(alpha = 0.5f)

@Composable
private fun FeeRow(label: String, amount: Int, bold: Boolean = false) {
    Row(Modifier.fillMaxWidth().padding(vertical = 2.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, fontSize = 13.sp, color = if (bold) Ink else Muted, fontWeight = if (bold) FontWeight.ExtraBold else FontWeight.Normal)
        Text(if (amount == 0) "Free" else "₹$amount", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Ink)
    }
}

package com.sevakendra.app.data

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import org.json.JSONArray
import org.json.JSONObject

/** Phone mein data save karta hai: profile, applications, cart. */
class Store(context: Context) {
    private val prefs = context.getSharedPreferences("seva_kendra", Context.MODE_PRIVATE)

    var name by mutableStateOf(prefs.getString("name", "") ?: "")
        private set
    var mobile by mutableStateOf(prefs.getString("mobile", "") ?: "")
        private set
    var address by mutableStateOf(prefs.getString("address", "") ?: "")
        private set

    val applications = mutableStateListOf<Application>().apply { addAll(loadApps()) }

    /** productId -> quantity */
    val cart = mutableStateMapOf<String, Int>()

    fun saveProfile(name: String, mobile: String, address: String) {
        this.name = name.trim()
        this.mobile = mobile.trim()
        this.address = address.trim()
        prefs.edit()
            .putString("name", this.name)
            .putString("mobile", this.mobile)
            .putString("address", this.address)
            .apply()
    }

    fun addApplication(app: Application) {
        applications.add(0, app)
        persistApps()
    }

    fun nextApplicationId(): String {
        val n = prefs.getInt("app_counter", 1000) + 1
        prefs.edit().putInt("app_counter", n).apply()
        return "SK-$n"
    }

    fun changeQty(productId: String, delta: Int) {
        val q = (cart[productId] ?: 0) + delta
        if (q <= 0) cart.remove(productId) else cart[productId] = q
    }

    val cartCount: Int get() = cart.values.sum()

    val cartTotal: Int
        get() = cart.entries.sumOf { (id, q) ->
            (ShopConfig.products.firstOrNull { it.id == id }?.price ?: 0) * q
        }

    private fun persistApps() {
        val arr = JSONArray()
        applications.forEach {
            arr.put(
                JSONObject()
                    .put("id", it.id).put("serviceName", it.serviceName).put("emoji", it.emoji)
                    .put("variant", it.variant).put("date", it.date).put("total", it.total)
                    .put("status", it.status)
            )
        }
        prefs.edit().putString("apps", arr.toString()).apply()
    }

    private fun loadApps(): List<Application> {
        val raw = prefs.getString("apps", null) ?: return emptyList()
        return try {
            val arr = JSONArray(raw)
            (0 until arr.length()).map { i ->
                val o = arr.getJSONObject(i)
                Application(
                    id = o.getString("id"),
                    serviceName = o.getString("serviceName"),
                    emoji = o.getString("emoji"),
                    variant = o.getString("variant"),
                    date = o.getLong("date"),
                    total = o.getInt("total"),
                    status = o.getString("status"),
                )
            }
        } catch (e: Exception) {
            emptyList()
        }
    }
}

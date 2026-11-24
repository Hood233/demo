package com.sevakendra.app.ui

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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sevakendra.app.data.ShopConfig
import com.sevakendra.app.data.Store
import com.sevakendra.app.util.Actions

@Composable
fun CartScreen(store: Store, onBack: () -> Unit, onDone: () -> Unit) {
    val ctx = LocalContext.current
    var delivery by remember { mutableStateOf(false) }
    var name by remember { mutableStateOf(store.name) }
    var mobile by remember { mutableStateOf(store.mobile) }
    var address by remember { mutableStateOf(store.address) }

    val lines = store.cart.mapNotNull { (id, q) -> ShopConfig.products.firstOrNull { it.id == id }?.let { it to q } }

    Column(Modifier.fillMaxSize()) {
        ScreenHeader("🛒 Mera Cart", onBack)
        if (lines.isEmpty()) {
            Column(Modifier.fillMaxSize().padding(32.dp), horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center) {
                Text("🛒", fontSize = 56.sp)
                Text("Cart khali hai", fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(12.dp))
                BigButton("Shop par jaao", onClick = onBack)
            }
            return@Column
        }
        Column(Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(horizontal = 16.dp)) {
            Card {
                Column {
                    lines.forEachIndexed { i, (p, q) ->
                        if (i > 0) HorizontalDivider(color = Line.copy(alpha = 0.5f))
                        Row(Modifier.fillMaxWidth().padding(vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                            EmojiBox(p.emoji, BlueLight)
                            Spacer(Modifier.width(10.dp))
                            Column(Modifier.weight(1f)) {
                                Text(p.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text("₹${p.price} × $q = ₹${p.price * q}", fontSize = 12.sp, color = Muted)
                            }
                            QtyStepper(q, { store.changeQty(p.id, -1) }, { store.changeQty(p.id, 1) })
                        }
                    }
                }
            }
            Spacer(Modifier.height(10.dp))
            Card {
                Column {
                    Text("Kaise lenge?", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Spacer(Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Choice("🏪 Dukaan se lunga", !delivery, Modifier.weight(1f)) { delivery = false }
                        Choice("🛵 Ghar bhejo", delivery, Modifier.weight(1f)) { delivery = true }
                    }
                    OutlinedTextField(name, { name = it }, label = { Text("Naam") }, singleLine = true,
                        modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(mobile, { if (it.length <= 10) mobile = it.filter(Char::isDigit) },
                        label = { Text("Mobile") }, singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        modifier = Modifier.fillMaxWidth())
                    if (delivery) {
                        OutlinedTextField(address, { address = it }, label = { Text("Ghar ka pata") },
                            modifier = Modifier.fillMaxWidth())
                    }
                }
            }
            Spacer(Modifier.height(10.dp))
            Card {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Total", fontWeight = FontWeight.ExtraBold, fontSize = 16.sp)
                    Text("₹${store.cartTotal}", fontWeight = FontWeight.ExtraBold, fontSize = 16.sp, color = Blue)
                }
            }
            Spacer(Modifier.height(12.dp))
        }
        Column(Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
            val ready = name.isNotBlank() && mobile.length == 10 && (!delivery || address.isNotBlank())
            BigButton("💳 UPI se ₹${store.cartTotal} Pay karo", color = Saffron) {
                Actions.payUpi(ctx, store.cartTotal, "Stationery - $name")
            }
            BigButton("📤 WhatsApp par Order Bhejo", enabled = ready) {
                store.saveProfile(name, mobile, if (delivery) address else store.address)
                val msg = buildString {
                    appendLine("🛒 *Stationery Order*")
                    lines.forEach { (p, q) -> appendLine("• ${p.name} × $q = ₹${p.price * q}") }
                    appendLine("💰 Total: ₹${store.cartTotal}")
                    appendLine("👤 $name · 📞 $mobile")
                    appendLine(if (delivery) "🛵 Delivery: $address" else "🏪 Dukaan se pickup")
                }
                Actions.whatsAppText(ctx, msg)
                store.cart.clear()
                onDone()
            }
            if (!ready) Text("Naam, mobile${if (delivery) " aur pata" else ""} bharein", fontSize = 11.sp,
                color = Color.Gray, modifier = Modifier.align(Alignment.CenterHorizontally))
        }
    }
}

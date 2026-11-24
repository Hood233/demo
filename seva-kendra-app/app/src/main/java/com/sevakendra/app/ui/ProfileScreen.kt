package com.sevakendra.app.ui

import android.widget.Toast
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sevakendra.app.data.ShopConfig
import com.sevakendra.app.data.Store
import com.sevakendra.app.util.Actions

@Composable
fun ProfileScreen(store: Store) {
    val ctx = LocalContext.current
    var name by remember { mutableStateOf(store.name) }
    var mobile by remember { mutableStateOf(store.mobile) }
    var address by remember { mutableStateOf(store.address) }

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        ScreenHeader("👤 Profile")
        Column(Modifier.padding(horizontal = 16.dp)) {
            Card {
                Column {
                    Text("Aapki jaankari (form mein apne aap bhar jaayegi)", fontSize = 12.sp, color = Muted)
                    OutlinedTextField(name, { name = it }, label = { Text("Naam") }, singleLine = true,
                        modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(mobile, { if (it.length <= 10) mobile = it.filter(Char::isDigit) },
                        label = { Text("Mobile") }, singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(address, { address = it }, label = { Text("Pata") },
                        modifier = Modifier.fillMaxWidth())
                    Spacer(Modifier.height(8.dp))
                    BigButton("Save karo") {
                        store.saveProfile(name, mobile, address)
                        Toast.makeText(ctx, "Save ho gaya ✓", Toast.LENGTH_SHORT).show()
                    }
                }
            }
            SectionTitle("Dukaan se sampark")
            Card {
                Column {
                    Text(ShopConfig.SHOP_NAME, fontWeight = FontWeight.ExtraBold, fontSize = 15.sp)
                    Text("📍 ${ShopConfig.ADDRESS}", fontSize = 13.sp, color = Muted)
                    Text("🕘 ${ShopConfig.TIMINGS}", fontSize = 13.sp, color = Muted)
                    Spacer(Modifier.height(8.dp))
                    BigButton("📞 Call karo") { Actions.call(ctx) }
                    BigButton("💬 WhatsApp karo", color = Green) {
                        Actions.whatsAppText(ctx, "Namaste, mujhe ek kaam ke baare mein poochhna hai.")
                    }
                    BigButton("📍 Map par dekho", color = Saffron) { Actions.map(ctx) }
                }
            }
            Spacer(Modifier.height(20.dp))
        }
    }
}

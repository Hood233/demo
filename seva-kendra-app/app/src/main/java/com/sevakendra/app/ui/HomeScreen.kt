package com.sevakendra.app.ui

import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sevakendra.app.data.ShopConfig
import com.sevakendra.app.data.Store
import com.sevakendra.app.util.Actions

@Composable
fun HomeScreen(store: Store, onService: (String) -> Unit, onShop: () -> Unit) {
    val ctx = LocalContext.current
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        // Upar neela header
        Column(
            Modifier.fillMaxWidth()
                .clip(RoundedCornerShape(bottomStart = 24.dp, bottomEnd = 24.dp))
                .background(Brush.horizontalGradient(listOf(Blue, Color(0xFF1E88E5))))
                .padding(18.dp)
        ) {
            val hello = if (store.name.isBlank()) "Namaste 🙏" else "Namaste, ${store.name} 🙏"
            Text(hello, color = Color.White.copy(alpha = 0.85f), fontSize = 13.sp)
            Text(ShopConfig.SHOP_NAME, color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 21.sp)
            Spacer(Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                HeaderButton("📞 Call", Modifier.weight(1f)) { Actions.call(ctx) }
                HeaderButton("💬 WhatsApp", Modifier.weight(1f)) {
                    Actions.whatsAppText(ctx, "Namaste, mujhe ek kaam ke baare mein poochhna hai.")
                }
                HeaderButton("📍 Map", Modifier.weight(1f)) { Actions.map(ctx) }
            }
        }

        Column(Modifier.padding(horizontal = 16.dp)) {
            SectionTitle("Online Services")
            ShopConfig.services.chunked(4).forEach { row ->
                Row(Modifier.fillMaxWidth().padding(bottom = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    row.forEach { s ->
                        Surface(
                            shape = RoundedCornerShape(14.dp), color = Color.White, shadowElevation = 2.dp,
                            modifier = Modifier.weight(1f).clickable { onService(s.id) },
                        ) {
                            Column(Modifier.padding(vertical = 10.dp, horizontal = 2.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                EmojiBox(s.emoji, Color(s.color))
                                Spacer(Modifier.height(5.dp))
                                Text(s.name, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Ink,
                                    textAlign = TextAlign.Center, maxLines = 2, lineHeight = 13.sp)
                            }
                        }
                    }
                    repeat(4 - row.size) { Spacer(Modifier.weight(1f)) }
                }
            }

            if (ShopConfig.NOTICE_TITLE.isNotBlank()) {
                Column(
                    Modifier.fillMaxWidth().padding(top = 8.dp).clip(RoundedCornerShape(16.dp))
                        .background(Brush.horizontalGradient(listOf(Saffron, Color(0xFFFFB300))))
                        .clickable { onService("exam") }
                        .padding(14.dp)
                ) {
                    Text(ShopConfig.NOTICE_TITLE, color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 15.sp)
                    Text(ShopConfig.NOTICE_TEXT, color = Color.White, fontSize = 12.sp)
                }
            }

            SectionTitle("Stationery", "Shop →", onShop)
            Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                ShopConfig.products.take(6).forEach { p ->
                    Surface(shape = RoundedCornerShape(14.dp), color = Color.White, shadowElevation = 2.dp,
                        modifier = Modifier.width(86.dp).clickable(onClick = onShop)) {
                        Column(Modifier.padding(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(p.emoji, fontSize = 28.sp)
                            Text(p.name, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, color = Ink)
                            Text("₹${p.price}", fontSize = 12.sp, fontWeight = FontWeight.ExtraBold, color = Blue)
                        }
                    }
                }
            }

            SectionTitle("Dukaan")
            Card {
                Column {
                    Text("📍 ${ShopConfig.ADDRESS}", fontSize = 13.sp, color = Ink)
                    Spacer(Modifier.height(4.dp))
                    Text("🕘 ${ShopConfig.TIMINGS}", fontSize = 13.sp, color = Muted)
                }
            }
            Spacer(Modifier.height(20.dp))
        }
    }
}

@Composable
private fun HeaderButton(text: String, modifier: Modifier, onClick: () -> Unit) {
    Text(
        text, color = Blue, fontWeight = FontWeight.Bold, fontSize = 12.sp, textAlign = TextAlign.Center,
        modifier = modifier.clip(RoundedCornerShape(12.dp)).background(Color.White)
            .clickable(onClick = onClick).padding(vertical = 9.dp),
    )
}

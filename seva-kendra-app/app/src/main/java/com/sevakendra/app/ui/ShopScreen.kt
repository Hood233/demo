package com.sevakendra.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sevakendra.app.data.ShopConfig
import com.sevakendra.app.data.Store

private val tileColors = listOf(0xFFE3F2FD, 0xFFFFF3E0, 0xFFE8F5E9, 0xFFFCE4EC, 0xFFEDE7F6, 0xFFE0F7FA)

@Composable
fun ShopScreen(store: Store, onCart: () -> Unit) {
    val categories = listOf("Sab") + ShopConfig.products.map { it.category }.distinct()
    var cat by remember { mutableStateOf("Sab") }
    val list = ShopConfig.products.filter { cat == "Sab" || it.category == cat }

    Column(Modifier.fillMaxSize()) {
        ScreenHeader("🛒 Stationery Shop")
        Row(
            Modifier.horizontalScroll(rememberScrollState()).padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            categories.forEach { c ->
                val on = c == cat
                Text(
                    c, fontSize = 12.sp, fontWeight = FontWeight.SemiBold,
                    color = if (on) Color.White else Muted,
                    modifier = Modifier.clip(RoundedCornerShape(16.dp))
                        .background(if (on) Saffron else Color.White)
                        .clickable { cat = c }
                        .padding(horizontal = 14.dp, vertical = 7.dp),
                )
            }
        }
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            modifier = Modifier.weight(1f),
            contentPadding = PaddingValues(16.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            items(list, key = { it.id }) { p ->
                val qty = store.cart[p.id] ?: 0
                Surface(shape = RoundedCornerShape(14.dp), color = Color.White, shadowElevation = 2.dp) {
                    Column(Modifier.padding(9.dp)) {
                        Box(
                            Modifier.fillMaxWidth().height(70.dp).clip(RoundedCornerShape(10.dp))
                                .background(Color(tileColors[ShopConfig.products.indexOf(p) % tileColors.size])),
                            contentAlignment = Alignment.Center,
                        ) { Text(p.emoji, fontSize = 36.sp) }
                        Text(p.name, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Ink, maxLines = 1,
                            modifier = Modifier.padding(top = 6.dp))
                        Text(p.detail, fontSize = 11.sp, color = Faint)
                        Row(Modifier.fillMaxWidth().padding(top = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text("₹${p.price}", fontWeight = FontWeight.ExtraBold, color = Blue, fontSize = 14.sp,
                                modifier = Modifier.weight(1f))
                            if (qty == 0) {
                                Text("ADD", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold,
                                    modifier = Modifier.clip(RoundedCornerShape(8.dp)).background(Saffron)
                                        .clickable { store.changeQty(p.id, 1) }
                                        .padding(horizontal = 12.dp, vertical = 5.dp))
                            } else {
                                QtyStepper(qty, { store.changeQty(p.id, -1) }, { store.changeQty(p.id, 1) })
                            }
                        }
                    }
                }
            }
        }
        if (store.cartCount > 0) {
            Row(
                Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp)
                    .clip(RoundedCornerShape(14.dp)).background(Ink).clickable(onClick = onCart)
                    .padding(horizontal = 16.dp, vertical = 13.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("🛒 ${store.cartCount} items · ₹${store.cartTotal}", color = Color.White,
                    fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                Text("Cart dekho →", color = Color.White, fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.height(2.dp))
        }
    }
}

package com.sevakendra.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sevakendra.app.data.Store
import com.sevakendra.app.util.Actions
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun ApplicationsScreen(store: Store, onHome: () -> Unit) {
    val ctx = LocalContext.current
    val fmt = SimpleDateFormat("dd MMM yyyy", Locale("en", "IN"))
    Column(Modifier.fillMaxSize()) {
        ScreenHeader("📋 Meri Applications")
        if (store.applications.isEmpty()) {
            Box(Modifier.fillMaxSize().padding(32.dp), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("🗂️", fontSize = 56.sp)
                    Text("Abhi koi form nahi bheja", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Text("Home par jaakar koi service chunein", color = Muted, fontSize = 13.sp, textAlign = TextAlign.Center)
                    Spacer(Modifier.height(12.dp))
                    BigButton("Service chunein", onClick = onHome)
                }
            }
            return@Column
        }
        LazyColumn(
            Modifier.padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            items(store.applications, key = { it.id }) { app ->
                Card {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text("${app.emoji} ${app.serviceName}", fontWeight = FontWeight.ExtraBold, fontSize = 15.sp)
                                Text("ID: ${app.id} · ${app.variant} · ${fmt.format(Date(app.date))}", fontSize = 11.sp, color = Faint)
                            }
                            Tag(app.status, Orange, OrangeLight)
                        }
                        Spacer(Modifier.height(10.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            StepDot("✓", Green)
                            listOf("2", "3", "4").forEach { n ->
                                Box(Modifier.weight(1f).height(3.dp).background(Line))
                                StepDot(n, Line)
                            }
                        }
                        Row(Modifier.fillMaxWidth().padding(top = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                            listOf("Bheja", "Form Bhara", "Govt Check", "Ready").forEach {
                                Text(it, fontSize = 10.sp, color = Muted)
                            }
                        }
                        TextButton(onClick = {
                            Actions.whatsAppText(ctx, "Namaste, mere form ${app.id} (${app.serviceName}) ka status kya hai?")
                        }) { Text("💬 WhatsApp par status poochho", color = Green, fontWeight = FontWeight.Bold) }
                    }
                }
            }
            item {
                Text(
                    "ℹ️ Form ka har update dukaan se WhatsApp / SMS par aayega.",
                    fontSize = 12.sp, color = Muted, modifier = Modifier.padding(vertical = 12.dp)
                )
            }
        }
    }
}

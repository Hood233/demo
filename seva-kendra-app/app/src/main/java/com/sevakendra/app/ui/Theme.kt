package com.sevakendra.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

val Blue = Color(0xFF1565C0)
val BlueLight = Color(0xFFE3F2FD)
val Saffron = Color(0xFFFF8F00)
val Ink = Color(0xFF1A2B4C)
val Muted = Color(0xFF5B6B8C)
val Faint = Color(0xFF90A0BF)
val Bg = Color(0xFFF6F8FC)
val Line = Color(0xFFD6DEEB)
val Green = Color(0xFF2E7D32)
val GreenLight = Color(0xFFE8F5E9)
val Orange = Color(0xFFE65100)
val OrangeLight = Color(0xFFFFF3E0)

@Composable
fun SevaTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = Blue, secondary = Saffron, background = Bg, surface = Color.White,
            onPrimary = Color.White, onBackground = Ink, onSurface = Ink,
        ),
        content = content,
    )
}

/** Safed card jisme halki shadow ho. */
@Composable
fun Card(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = Color.White,
        shadowElevation = 2.dp,
    ) { Box(Modifier.padding(14.dp)) { content() } }
}

@Composable
fun SectionTitle(text: String, action: String? = null, onAction: () -> Unit = {}) {
    Row(
        Modifier.fillMaxWidth().padding(top = 18.dp, bottom = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(text, fontWeight = FontWeight.ExtraBold, fontSize = 16.sp, color = Ink)
        if (action != null) {
            Text(action, color = Blue, fontWeight = FontWeight.SemiBold, fontSize = 13.sp,
                modifier = Modifier.clickable(onClick = onAction))
        }
    }
}

/** Chunne wala button (Naya PAN / Correction, Pickup / Delivery). */
@Composable
fun Choice(text: String, selected: Boolean, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Box(
        modifier
            .clip(RoundedCornerShape(10.dp))
            .background(if (selected) Blue else Color.White)
            .border(1.5.dp, if (selected) Blue else Line, RoundedCornerShape(10.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 9.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(text, color = if (selected) Color.White else Muted, fontWeight = FontWeight.Bold, fontSize = 13.sp)
    }
}

@Composable
fun Tag(text: String, fg: Color, bg: Color) {
    Text(
        text, color = fg, fontSize = 11.sp, fontWeight = FontWeight.Bold,
        modifier = Modifier.clip(RoundedCornerShape(10.dp)).background(bg)
            .padding(horizontal = 9.dp, vertical = 4.dp),
    )
}

@Composable
fun BigButton(text: String, color: Color = Blue, enabled: Boolean = true, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        shape = RoundedCornerShape(14.dp),
        colors = ButtonDefaults.buttonColors(containerColor = color),
    ) { Text(text, fontWeight = FontWeight.ExtraBold, fontSize = 15.sp, modifier = Modifier.padding(vertical = 6.dp)) }
}

@Composable
fun QtyStepper(qty: Int, onMinus: () -> Unit, onPlus: () -> Unit) {
    Row(
        Modifier.clip(RoundedCornerShape(8.dp)).background(Saffron),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text("−", color = Color.White, fontWeight = FontWeight.Bold,
            modifier = Modifier.clickable(onClick = onMinus).padding(horizontal = 9.dp, vertical = 3.dp))
        Text("$qty", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
        Text("+", color = Color.White, fontWeight = FontWeight.Bold,
            modifier = Modifier.clickable(onClick = onPlus).padding(horizontal = 9.dp, vertical = 3.dp))
    }
}

@Composable
fun EmojiBox(emoji: String, bg: Color, size: Int = 40, fontSize: Int = 20) {
    Box(
        Modifier.size(size.dp).clip(RoundedCornerShape(12.dp)).background(bg),
        contentAlignment = Alignment.Center,
    ) { Text(emoji, fontSize = fontSize.sp) }
}

@Composable
fun StepDot(text: String, color: Color) {
    Box(Modifier.size(22.dp).clip(CircleShape).background(color), contentAlignment = Alignment.Center) {
        Text(text, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun ScreenHeader(title: String, onBack: (() -> Unit)? = null) {
    Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 14.dp), verticalAlignment = Alignment.CenterVertically) {
        if (onBack != null) {
            Surface(shape = RoundedCornerShape(10.dp), color = Color.White, shadowElevation = 2.dp,
                modifier = Modifier.size(36.dp).clickable(onClick = onBack)) {
                Box(contentAlignment = Alignment.Center) { Text("←", fontSize = 18.sp, color = Ink) }
            }
            Box(Modifier.size(10.dp))
        }
        Column { Text(title, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp, color = Ink) }
    }
}

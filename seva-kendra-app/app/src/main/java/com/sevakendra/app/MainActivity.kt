package com.sevakendra.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.sp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.sevakendra.app.data.Store
import com.sevakendra.app.ui.ApplicationsScreen
import com.sevakendra.app.ui.Bg
import com.sevakendra.app.ui.Blue
import com.sevakendra.app.ui.BlueLight
import com.sevakendra.app.ui.CartScreen
import com.sevakendra.app.ui.Faint
import com.sevakendra.app.ui.HomeScreen
import com.sevakendra.app.ui.ProfileScreen
import com.sevakendra.app.ui.ServiceScreen
import com.sevakendra.app.ui.SevaTheme
import com.sevakendra.app.ui.ShopScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { SevaTheme { App() } }
    }
}

private data class Tab(val route: String, val emoji: String, val label: String)

private val tabs = listOf(
    Tab("home", "🏠", "Home"),
    Tab("apps", "📋", "Meri Apps"),
    Tab("shop", "🛒", "Shop"),
    Tab("profile", "👤", "Profile"),
)

@Composable
private fun App() {
    val ctx = LocalContext.current
    val store = remember { Store(ctx.applicationContext) }
    val nav = rememberNavController()
    val entry by nav.currentBackStackEntryAsState()
    val current = entry?.destination?.route

    Scaffold(
        containerColor = Bg,
        bottomBar = {
            if (tabs.any { it.route == current }) {
                NavigationBar(containerColor = Color.White) {
                    tabs.forEach { t ->
                        NavigationBarItem(
                            selected = current == t.route,
                            onClick = { nav.goTab(t.route) },
                            icon = { Text(t.emoji, fontSize = 20.sp) },
                            label = { Text(t.label, fontSize = 11.sp) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedTextColor = Blue, unselectedTextColor = Faint, indicatorColor = BlueLight,
                            ),
                        )
                    }
                }
            }
        },
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            NavHost(nav, startDestination = "home") {
                composable("home") {
                    HomeScreen(store, onService = { nav.navigate("service/$it") }, onShop = { nav.goTab("shop") })
                }
                composable("apps") { ApplicationsScreen(store, onHome = { nav.goTab("home") }) }
                composable("shop") { ShopScreen(store, onCart = { nav.navigate("cart") }) }
                composable("profile") { ProfileScreen(store) }
                composable("service/{id}") { e ->
                    ServiceScreen(
                        store, e.arguments?.getString("id").orEmpty(),
                        onBack = { nav.popBackStack() },
                        onDone = { nav.goTab("apps") },
                    )
                }
                composable("cart") {
                    CartScreen(store, onBack = { nav.popBackStack() }, onDone = { nav.goTab("home") })
                }
            }
        }
    }
}

private fun NavHostController.goTab(route: String) = navigate(route) {
    popUpTo(graph.findStartDestination().id) { saveState = true }
    launchSingleTop = true
    restoreState = true
}

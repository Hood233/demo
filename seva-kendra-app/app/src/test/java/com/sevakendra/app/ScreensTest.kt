package com.sevakendra.app

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import app.cash.paparazzi.DeviceConfig
import app.cash.paparazzi.Paparazzi
import com.sevakendra.app.data.Application
import com.sevakendra.app.data.Store
import com.sevakendra.app.ui.ApplicationsScreen
import com.sevakendra.app.ui.CartScreen
import com.sevakendra.app.ui.HomeScreen
import com.sevakendra.app.ui.ProfileScreen
import com.sevakendra.app.ui.ServiceScreen
import com.sevakendra.app.ui.SevaTheme
import com.sevakendra.app.ui.ShopScreen
import com.sevakendra.app.ui.Bg
import androidx.compose.foundation.background
import androidx.activity.compose.LocalActivityResultRegistryOwner
import androidx.activity.result.ActivityResultRegistry
import androidx.activity.result.ActivityResultRegistryOwner
import androidx.activity.result.contract.ActivityResultContract
import androidx.compose.runtime.CompositionLocalProvider
import androidx.core.app.ActivityOptionsCompat
import org.junit.Rule
import org.junit.Test

/** Har screen ko bina phone ke render karke check karta hai. */
class ScreensTest {
    @get:Rule
    val paparazzi = Paparazzi(deviceConfig = DeviceConfig.PIXEL_5)

    private fun store() = Store(paparazzi.context).apply {
        saveProfile("Rahul Kumar", "9876543210", "Ward 5, Main Road")
    }

    private fun shot(content: @Composable () -> Unit) = paparazzi.snapshot {
        SevaTheme { Box(Modifier.fillMaxSize().background(Bg)) { content() } }
    }

    @Test fun home() = shot { HomeScreen(store(), {}, {}) }

    private val fakeRegistry = object : ActivityResultRegistryOwner {
        override val activityResultRegistry = object : ActivityResultRegistry() {
            override fun <I, O> onLaunch(
                requestCode: Int, contract: ActivityResultContract<I, O>, input: I, options: ActivityOptionsCompat?,
            ) = Unit
        }
    }

    @Test fun service() = shot {
        CompositionLocalProvider(LocalActivityResultRegistryOwner provides fakeRegistry) {
            ServiceScreen(store(), "pan", {}, {})
        }
    }

    @Test fun applications() = shot {
        val s = store()
        if (s.applications.isEmpty()) {
            s.addApplication(Application("SK-1002", "BC Certificate", "📜", "Naya", 1732400000000, 100, "Bheja gaya"))
            s.addApplication(Application("SK-1001", "PAN Card", "🪪", "Naya PAN", 1732300000000, 157, "Bheja gaya"))
        }
        ApplicationsScreen(s) {}
    }

    @Test fun shop() = shot {
        val s = store(); s.cart.clear(); s.changeQty("copy172", 2); s.changeQty("pen10", 1)
        ShopScreen(s) {}
    }

    @Test fun cart() = shot {
        val s = store(); s.cart.clear(); s.changeQty("copy172", 2); s.changeQty("a4", 1)
        CartScreen(s, {}, {})
    }

    @Test fun profile() = shot { ProfileScreen(store()) }
}

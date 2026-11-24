package com.sevakendra.app.data

/**
 * ===============================================================
 *  DUKAAN KI SETTINGS — sirf yahi file badalni hai
 *  (naam, WhatsApp number, UPI ID, services, fees, stationery)
 * ===============================================================
 */
object ShopConfig {

    // ---- Dukaan ki jaankari ----
    const val SHOP_NAME = "Sharma Online Seva Kendra"
    const val OWNER_WHATSAPP = "919999999999"   // 91 + 10 digit mobile number (bina + ke)
    const val OWNER_CALL = "+919999999999"
    const val UPI_ID = "yourname@upi"            // apni UPI ID daalein
    const val UPI_NAME = "Sharma Seva Kendra"
    const val ADDRESS = "Main Market, Aapka Shehar"
    const val TIMINGS = "Subah 9 baje – Shaam 8 baje (Ravivar band)"

    // Home screen par dikhne wali suchna (khali chhod do to nahi dikhegi)
    const val NOTICE_TITLE = "📢 Naya: Sarkari Job Form"
    const val NOTICE_TEXT = "Last date paas hai · Ghar baithe apply karwayein"

    // ---- Online Services ----
    // govtFee = sarkari fees, serviceCharge = aapka charge (₹ mein)
    val services = listOf(
        Service(
            id = "pan", name = "PAN Card", emoji = "🪪", color = 0xFFE3F2FD,
            variants = listOf("Naya PAN", "Correction", "Lost / Duplicate"),
            docs = listOf(Doc("Aadhaar Card", "🆔"), Doc("Passport Photo", "📷"), Doc("Signature", "✍️")),
            govtFee = 107, serviceCharge = 50, days = "7–15 din mein PAN ghar aayega"
        ),
        Service(
            id = "passport", name = "Passport", emoji = "🛂", color = 0xFFEDE7F6,
            variants = listOf("Naya (Fresh)", "Renewal", "Tatkal"),
            docs = listOf(Doc("Aadhaar Card", "🆔"), Doc("10th Marksheet / Birth Certificate", "📄"), Doc("Address Proof", "🏠")),
            govtFee = 1500, serviceCharge = 200, days = "Appointment ki date WhatsApp par bhejenge"
        ),
        Service(
            id = "bc", name = "BC Certificate", emoji = "📜", color = 0xFFFFF3E0,
            variants = listOf("Naya", "Renewal"),
            docs = listOf(Doc("Aadhaar Card", "🆔"), Doc("Ration Card / Family ID", "🪪"), Doc("Passport Photo", "📷"), Doc("Purana Caste Proof (agar ho)", "📄")),
            govtFee = 0, serviceCharge = 100, days = "Lagbhag 7–21 din"
        ),
        Service(
            id = "sc", name = "SC/ST Certificate", emoji = "📃", color = 0xFFE8F5E9,
            variants = listOf("Naya", "Renewal"),
            docs = listOf(Doc("Aadhaar Card", "🆔"), Doc("Ration Card / Family ID", "🪪"), Doc("Passport Photo", "📷"), Doc("Pita ka Caste Certificate", "📄")),
            govtFee = 0, serviceCharge = 100, days = "Lagbhag 7–21 din"
        ),
        Service(
            id = "niwas", name = "Niwas Praman", emoji = "🏠", color = 0xFFFCE4EC,
            variants = listOf("Naya", "Renewal"),
            docs = listOf(Doc("Aadhaar Card", "🆔"), Doc("Bijli Bill / Address Proof", "💡"), Doc("Passport Photo", "📷")),
            govtFee = 0, serviceCharge = 80, days = "Lagbhag 7–15 din"
        ),
        Service(
            id = "aay", name = "Aay Praman", emoji = "💰", color = 0xFFE0F7FA,
            variants = listOf("Naya", "Renewal"),
            docs = listOf(Doc("Aadhaar Card", "🆔"), Doc("Ration Card", "🪪"), Doc("Self Declaration", "✍️"), Doc("Passport Photo", "📷")),
            govtFee = 0, serviceCharge = 80, days = "Lagbhag 7–15 din"
        ),
        Service(
            id = "exam", name = "Exam / Job Form", emoji = "🎓", color = 0xFFF1F8E9,
            variants = listOf("Sarkari Job", "Admission", "Scholarship"),
            docs = listOf(Doc("Aadhaar Card", "🆔"), Doc("Marksheets", "📄"), Doc("Photo", "📷"), Doc("Signature", "✍️")),
            govtFee = 0, serviceCharge = 100, days = "Form fees alag se (form ke hisaab se)"
        ),
        Service(
            id = "other", name = "Aur Koi Kaam", emoji = "➕", color = 0xFFECEFF1,
            variants = listOf("Aadhaar Update", "Ration Card", "Bijli Bill", "Anya"),
            docs = listOf(Doc("Zaroori document", "📎")),
            govtFee = 0, serviceCharge = 50, days = "WhatsApp par baat karke bata denge"
        ),
    )

    // ---- Stationery ----
    val products = listOf(
        Product("copy172", "Classmate Copy", "172 pages", 40, "📒", "Copy"),
        Product("copy300", "Long Register", "300 pages", 90, "📓", "Copy"),
        Product("pen10", "Blue Pen (Pack 10)", "Ball pen", 50, "🖊️", "Pen"),
        Product("gel", "Gel Pen", "Black", 10, "✒️", "Pen"),
        Product("pencil", "Pencil Box", "10 pencil", 60, "✏️", "Pen"),
        Product("a4", "A4 Paper Rim", "500 sheets", 280, "📄", "Paper"),
        Product("chart", "Chart Paper", "1 sheet", 10, "🗒️", "Paper"),
        Product("file", "Clear File", "Document folder", 15, "📁", "File"),
        Product("folder", "Box File", "Office file", 60, "🗂️", "File"),
        Product("geo", "Geometry Box", "Complete set", 120, "📐", "Aur"),
        Product("glue", "Fevistick", "15 g", 25, "🧴", "Aur"),
        Product("eraser", "Eraser + Sharpener", "Set", 10, "🧽", "Aur"),
    )
}

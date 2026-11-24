package com.sevakendra.app.data

data class Doc(val name: String, val emoji: String)

data class Service(
    val id: String,
    val name: String,
    val emoji: String,
    val color: Long,
    val variants: List<String>,
    val docs: List<Doc>,
    val govtFee: Int,
    val serviceCharge: Int,
    val days: String,
) {
    val total: Int get() = govtFee + serviceCharge
}

data class Product(
    val id: String,
    val name: String,
    val detail: String,
    val price: Int,
    val emoji: String,
    val category: String,
)

data class Application(
    val id: String,
    val serviceName: String,
    val emoji: String,
    val variant: String,
    val date: Long,
    val total: Int,
    val status: String,
)

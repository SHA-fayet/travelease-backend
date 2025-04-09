// Perfect mapping of all 51 AI classes to their Bangladeshi Districts
export const placeToDistrictMap = {
  // Dhaka Division
  "Ahsan_Manzil": "Dhaka",
  "Armenian_Church": "Dhaka",
  "Dhakeshwari_Temple": "Dhaka",
  "Lalbagh_Fort": "Dhaka",
  "Ramna_Park": "Dhaka",
  "Shohid_Minar": "Dhaka",
  "Sriti_Shoudho": "Dhaka",
  "Bhawal_National_uddan": "Gazipur",
  "Bhawal_resort_and_spa": "Gazipur",
  "Chuti_resort": "Gazipur",
  "Dream_square_resort": "Gazipur",
  "Reverie_resort": "Gazipur",
  "Sarah_resort": "Gazipur",
  "Panam_Nagar": "Narayanganj",
  "Mithamain_Haor": "Kishoreganj",
  "Nikli_Haor": "Kishoreganj",

  // Chattogram (Chittagong) Division
  "Potenga_Sea_Beach": "Chattogram",
  "Chondronath_Pahar_Shitakundo": "Chattogram",
  "Guliyakhan_Sea_Beach_Shitakundo": "Chattogram",
  "Khoiyachora_Waterfall": "Chattogram",
  "Mohamaya_Lake": "Chattogram",
  "Coxsbazar_Sea_Beach": "Cox's Bazar",
  "Himchori": "Cox's Bazar",
  "Inani_Beach": "Cox's Bazar",
  "Saint_Martin": "Cox's Bazar",
  "Shalbon_Bihar": "Cumilla",

  // Chattogram Hill Tracts
  "Chimbuk_Hill": "Bandarban",
  "Debotakhum": "Bandarban",
  "Nafakhum": "Bandarban",
  "Nilachol": "Bandarban",
  "Nilgiri": "Bandarban",
  "Kaptai_Lake": "Rangamati",
  "Hanging_Bridge": "Rangamati",
  "Rajbon_Bihar": "Rangamati",
  "Sajek_Valley": "Rangamati",
  "Alutila_Cave": "Khagrachhari",

  // Sylhet Division
  "Bichnakandi": "Sylhet",
  "Hazrat_Shahjalal_Mazar": "Sylhet",
  "Jaflong": "Sylhet",
  "Shada_Pathor": "Sylhet",
  "Madhobkundo_Waterfall": "Moulvibazar",
  "Madhobpur_Lake": "Moulvibazar",
  "Sreemangal": "Moulvibazar",
  "Tanguar_Haor": "Sunamganj",

  // Khulna & Barishal Divisions
  "60_Gombuj_Mosque": "Bagerhat",
  "Sundarban": "Khulna",
  "Kuakata_Sea_Beach": "Patuakhali",
  "Lalon_Shah_Akhra": "Kushtia",

  // Rajshahi & Rangpur Divisions
  "Mohasthangor": "Bogura",
  "Paharpur_Boudho_Bihar": "Naogaon",
  "Chini_Mosque": "Nilphamari",

  // Mymensingh Division
  "Birishiri": "Netrokona"
};

/**
 * Helper function to retrieve the district for a given place.
 * Returns "Unknown District" if the AI predicts an unmapped class.
 */
export const getDistrictForPlace = (placeName) => {
  return placeToDistrictMap[placeName] || "Unknown District";
};
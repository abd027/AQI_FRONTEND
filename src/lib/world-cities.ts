// Comprehensive list of major world cities with coordinates
// Approximately 200 cities covering all continents and major regions

export interface WorldCity {
    name: string;
    country: string;
    lat: number;
    lng: number;
    population?: number;
}

export const WORLD_CITIES: WorldCity[] = [
    // Pakistan (Comprehensive List - 50+ Cities)
    // Punjab
    { name: 'Lahore', country: 'Pakistan', lat: 31.5204, lng: 74.3587, population: 11126285 },
    { name: 'Faisalabad', country: 'Pakistan', lat: 31.4504, lng: 73.1350, population: 3203846 },
    { name: 'Rawalpindi', country: 'Pakistan', lat: 33.5651, lng: 73.0169, population: 2098231 },
    { name: 'Gujranwala', country: 'Pakistan', lat: 32.1877, lng: 74.1945, population: 2027001 },
    { name: 'Multan', country: 'Pakistan', lat: 30.1575, lng: 71.5249, population: 1871843 },
    { name: 'Bahawalpur', country: 'Pakistan', lat: 29.3956, lng: 71.6836, population: 762111 },
    { name: 'Sargodha', country: 'Pakistan', lat: 32.0836, lng: 72.6711, population: 659862 },
    { name: 'Sialkot', country: 'Pakistan', lat: 32.4945, lng: 74.5229, population: 655852 },
    { name: 'Sheikhupura', country: 'Pakistan', lat: 31.7131, lng: 73.9783, population: 473129 },
    { name: 'Rahim Yar Khan', country: 'Pakistan', lat: 28.4195, lng: 70.2952, population: 420419 },
    { name: 'Jhang', country: 'Pakistan', lat: 31.2698, lng: 72.3169, population: 414131 },
    { name: 'Dera Ghazi Khan', country: 'Pakistan', lat: 30.0489, lng: 70.6325, population: 399033 },
    { name: 'Gujrat', country: 'Pakistan', lat: 32.5738, lng: 74.0802, population: 390533 },
    { name: 'Sahiwal', country: 'Pakistan', lat: 30.6682, lng: 73.1114, population: 389605 },
    { name: 'Wah Cantonment', country: 'Pakistan', lat: 33.7715, lng: 72.7235, population: 380103 },
    { name: 'Kasur', country: 'Pakistan', lat: 31.1187, lng: 74.4507, population: 358409 },
    { name: 'Okara', country: 'Pakistan', lat: 30.8080, lng: 73.4458, population: 357935 },
    { name: 'Chiniot', country: 'Pakistan', lat: 31.7200, lng: 72.9789, population: 278747 },
    { name: 'Kamoke', country: 'Pakistan', lat: 31.9765, lng: 74.2239, population: 249767 },
    { name: 'Hafizabad', country: 'Pakistan', lat: 32.0679, lng: 73.6851, population: 245784 },
    { name: 'Sadiqabad', country: 'Pakistan', lat: 28.3006, lng: 70.1302, population: 239677 },
    { name: 'Burewala', country: 'Pakistan', lat: 30.1553, lng: 72.6868, population: 231797 },
    { name: 'Khanewal', country: 'Pakistan', lat: 30.3017, lng: 71.9321, population: 227059 },
    { name: 'Muzaffargarh', country: 'Pakistan', lat: 30.0754, lng: 71.1921, population: 209604 },
    { name: 'Mandi Bahauddin', country: 'Pakistan', lat: 32.5855, lng: 73.4912, population: 198609 },

    // Sindh
    { name: 'Karachi', country: 'Pakistan', lat: 24.8607, lng: 67.0011, population: 14910352 },
    { name: 'Hyderabad', country: 'Pakistan', lat: 25.3960, lng: 68.3578, population: 1732693 },
    { name: 'Sukkur', country: 'Pakistan', lat: 27.7052, lng: 68.8574, population: 499900 },
    { name: 'Larkana', country: 'Pakistan', lat: 27.5570, lng: 68.2028, population: 490508 },
    { name: 'Nawabshah', country: 'Pakistan', lat: 26.2483, lng: 68.4096, population: 279688 },
    { name: 'Mirpur Khas', country: 'Pakistan', lat: 25.5269, lng: 69.0111, population: 233916 },
    { name: 'Jacobabad', country: 'Pakistan', lat: 28.2838, lng: 68.4380, population: 200815 },
    { name: 'Shikarpur', country: 'Pakistan', lat: 27.9571, lng: 68.6382, population: 195437 },

    // Khyber Pakhtunkhwa (KPK)
    { name: 'Peshawar', country: 'Pakistan', lat: 34.0151, lng: 71.5249, population: 1970042 },
    { name: 'Mardan', country: 'Pakistan', lat: 34.1989, lng: 72.0231, population: 358604 },
    { name: 'Mingora', country: 'Pakistan', lat: 34.7758, lng: 72.3625, population: 331091 },
    { name: 'Kohat', country: 'Pakistan', lat: 33.5820, lng: 71.4493, population: 228779 },
    { name: 'Abbottabad', country: 'Pakistan', lat: 34.1688, lng: 73.2215, population: 208491 },
    { name: 'Dera Ismail Khan', country: 'Pakistan', lat: 31.8326, lng: 70.9024, population: 217457 },
    { name: 'Swabi', country: 'Pakistan', lat: 34.1202, lng: 72.4810, population: 123412 },
    { name: 'Nowshera', country: 'Pakistan', lat: 34.0153, lng: 71.9747, population: 120131 },
    { name: 'Mansehra', country: 'Pakistan', lat: 34.3333, lng: 73.2000, population: 127623 },

    // Balochistan
    { name: 'Quetta', country: 'Pakistan', lat: 30.1798, lng: 66.9750, population: 1001205 },
    { name: 'Turbat', country: 'Pakistan', lat: 26.0083, lng: 63.0483, population: 213557 },
    { name: 'Khuzdar', country: 'Pakistan', lat: 27.7954, lng: 66.6033, population: 182927 },
    { name: 'Hub', country: 'Pakistan', lat: 25.0293, lng: 66.8687, population: 175376 },
    { name: 'Chaman', country: 'Pakistan', lat: 30.9177, lng: 66.4526, population: 123191 },
    { name: 'Gwadar', country: 'Pakistan', lat: 25.1264, lng: 62.3225, population: 90762 },

    // Federal Capital
    { name: 'Islamabad', country: 'Pakistan', lat: 33.6844, lng: 73.0479, population: 1014825 },

    // Azad Kashmir & Gilgit-Baltistan
    { name: 'Muzaffarabad', country: 'Pakistan', lat: 34.3700, lng: 73.4714, population: 150000 },
    { name: 'Mirpur', country: 'Pakistan', lat: 33.1484, lng: 73.7519, population: 124352 },
    { name: 'Gilgit', country: 'Pakistan', lat: 35.9187, lng: 74.3107, population: 216760 },
    { name: 'Skardu', country: 'Pakistan', lat: 35.2971, lng: 75.6333, population: 26023 },

    // India (25 cities)
    { name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, population: 20411274 },
    { name: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090, population: 16787941 },
    { name: 'Bangalore', country: 'India', lat: 12.9716, lng: 77.5946, population: 11440000 },
    { name: 'Hyderabad', country: 'India', lat: 17.3850, lng: 78.4867, population: 9482000 },
    { name: 'Chennai', country: 'India', lat: 13.0827, lng: 80.2707, population: 8917749 },
    { name: 'Kolkata', country: 'India', lat: 22.5726, lng: 88.3639, population: 14850000 },
    { name: 'Ahmedabad', country: 'India', lat: 23.0225, lng: 72.5714, population: 7650000 },
    { name: 'Pune', country: 'India', lat: 18.5204, lng: 73.8567, population: 6629347 },
    { name: 'Surat', country: 'India', lat: 21.1702, lng: 72.8311, population: 6081322 },
    { name: 'Jaipur', country: 'India', lat: 26.9124, lng: 75.7873, population: 4107000 },
    { name: 'Lucknow', country: 'India', lat: 26.8467, lng: 80.9462, population: 3945000 },
    { name: 'Kanpur', country: 'India', lat: 26.4499, lng: 80.3319, population: 3124000 },
    { name: 'Nagpur', country: 'India', lat: 21.1458, lng: 79.0882, population: 2893000 },
    { name: 'Indore', country: 'India', lat: 22.7196, lng: 75.8577, population: 2465000 },
    { name: 'Bhopal', country: 'India', lat: 23.2599, lng: 77.4126, population: 2371000 },

    // China (25 cities)
    { name: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737, population: 27058000 },
    { name: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074, population: 21540000 },
    { name: 'Chongqing', country: 'China', lat: 29.4316, lng: 106.9123, population: 15872000 },
    { name: 'Tianjin', country: 'China', lat: 39.3434, lng: 117.3616, population: 13866000 },
    { name: 'Guangzhou', country: 'China', lat: 23.1291, lng: 113.2644, population: 13501100 },
    { name: 'Shenzhen', country: 'China', lat: 22.5431, lng: 114.0579, population: 12528300 },
    { name: 'Chengdu', country: 'China', lat: 30.5728, lng: 104.0668, population: 10152000 },
    { name: 'Wuhan', country: 'China', lat: 30.5928, lng: 114.3055, population: 8364000 },
    { name: "Xi'an", country: 'China', lat: 34.3416, lng: 108.9398, population: 8000000 },
    { name: 'Hangzhou', country: 'China', lat: 30.2741, lng: 120.1551, population: 7642000 },
    { name: 'Nanjing', country: 'China', lat: 32.0603, lng: 118.7969, population: 7165000 },
    { name: 'Shenyang', country: 'China', lat: 41.8057, lng: 123.4315, population: 6921852 },
    { name: 'Harbin', country: 'China', lat: 45.8038, lng: 126.5350, population: 5878939 },
    { name: 'Qingdao', country: 'China', lat: 36.0671, lng: 120.3826, population: 5381000 },
    { name: 'Dalian', country: 'China', lat: 38.9140, lng: 121.6147, population: 4087000 },

    // Japan (10 cities)
    { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, population: 13960000 },
    { name: 'Yokohama', country: 'Japan', lat: 35.4437, lng: 139.6380, population: 3749000 },
    { name: 'Osaka', country: 'Japan', lat: 34.6937, lng: 135.5023, population: 2752000 },
    { name: 'Nagoya', country: 'Japan', lat: 35.1815, lng: 136.9066, population: 2320000 },
    { name: 'Sapporo', country: 'Japan', lat: 43.0621, lng: 141.3544, population: 1970000 },
    { name: 'Fukuoka', country: 'Japan', lat: 33.5902, lng: 130.4017, population: 1580000 },
    { name: 'Kobe', country: 'Japan', lat: 34.6901, lng: 135.1956, population: 1530000 },
    { name: 'Kyoto', country: 'Japan', lat: 35.0116, lng: 135.7681, population: 1470000 },
    { name: 'Kawasaki', country: 'Japan', lat: 35.5309, lng: 139.7030, population: 1530000 },
    { name: 'Hiroshima', country: 'Japan', lat: 34.3853, lng: 132.4553, population: 1200000 },

    // South Korea (5 cities)
    { name: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780, population: 9776000 },
    { name: 'Busan', country: 'South Korea', lat: 35.1796, lng: 129.0756, population: 3429000 },
    { name: 'Incheon', country: 'South Korea', lat: 37.4563, lng: 126.7052, population: 2957000 },
    { name: 'Daegu', country: 'South Korea', lat: 35.8714, lng: 128.6014, population: 2461000 },
    { name: 'Daejeon', country: 'South Korea', lat: 36.3504, lng: 127.3845, population: 1538000 },

    // Southeast Asia (15 cities)
    { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456, population: 10560000 },
    { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, population: 10539000 },
    { name: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.8231, lng: 106.6297, population: 8993000 },
    { name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, population: 5685800 },
    { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lng: 101.6869, population: 1768000 },
    { name: 'Manila', country: 'Philippines', lat: 14.5995, lng: 120.9842, population: 1780148 },
    { name: 'Hanoi', country: 'Vietnam', lat: 21.0285, lng: 105.8542, population: 8053663 },
    { name: 'Surabaya', country: 'Indonesia', lat: -7.2575, lng: 112.7521, population: 2874000 },
    { name: 'Yangon', country: 'Myanmar', lat: 16.8661, lng: 96.1951, population: 5160000 },
    { name: 'Phnom Penh', country: 'Cambodia', lat: 11.5564, lng: 104.9282, population: 2129371 },
    { name: 'Quezon City', country: 'Philippines', lat: 14.6760, lng: 121.0437, population: 2936000 },
    { name: 'Bandung', country: 'Indonesia', lat: -6.9175, lng: 107.6191, population: 2575000 },
    { name: 'Medan', country: 'Indonesia', lat: 3.5952, lng: 98.6722, population: 2435000 },
    { name: 'Cebu City', country: 'Philippines', lat: 10.3157, lng: 123.8854, population: 964000 },
    { name: 'Chiang Mai', country: 'Thailand', lat: 18.7883, lng: 98.9853, population: 131091 },

    // Middle East (15 cities)
    { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, population: 15462000 },
    { name: 'Tehran', country: 'Iran', lat: 35.6892, lng: 51.3890, population: 8846782 },
    { name: 'Baghdad', country: 'Iraq', lat: 33.3152, lng: 44.3661, population: 7665000 },
    { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753, population: 6881000 },
    { name: 'Jeddah', country: 'Saudi Arabia', lat: 21.5433, lng: 39.1728, population: 4082000 },
    { name: 'Ankara', country: 'Turkey', lat: 39.9334, lng: 32.8597, population: 5503985 },
    { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, population: 3331000 },
    { name: 'Tel Aviv', country: 'Israel', lat: 32.0853, lng: 34.7818, population: 451523 },
    { name: 'Beirut', country: 'Lebanon', lat: 33.8938, lng: 35.5018, population: 2060000 },
    { name: 'Amman', country: 'Jordan', lat: 31.9454, lng: 35.9284, population: 4302000 },
    { name: 'Kuwait City', country: 'Kuwait', lat: 29.3759, lng: 47.9774, population: 2989000 },
    { name: 'Doha', country: 'Qatar', lat: 25.2854, lng: 51.5310, population: 2382000 },
    { name: 'Abu Dhabi', country: 'UAE', lat: 24.4539, lng: 54.3773, population: 1483000 },
    { name: 'Muscat', country: 'Oman', lat: 23.5880, lng: 58.3829, population: 1421409 },
    { name: 'Damascus', country: 'Syria', lat: 33.5138, lng: 36.2765, population: 2079000 },

    // Europe (30 cities)
    { name: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6173, population: 12506000 },
    { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, population: 8982000 },
    { name: 'Saint Petersburg', country: 'Russia', lat: 59.9311, lng: 30.3609, population: 5383000 },
    { name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, population: 3645000 },
    { name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, population: 3266000 },
    { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, population: 2873000 },
    { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, population: 2161000 },
    { name: 'Vienna', country: 'Austria', lat: 48.2082, lng: 16.3738, population: 1897000 },
    { name: 'Hamburg', country: 'Germany', lat: 53.5511, lng: 9.9937, population: 1841000 },
    { name: 'Warsaw', country: 'Poland', lat: 52.2297, lng: 21.0122, population: 1783000 },
    { name: 'Budapest', country: 'Hungary', lat: 47.4979, lng: 19.0402, population: 1752000 },
    { name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734, population: 1620000 },
    { name: 'Munich', country: 'Germany', lat: 48.1351, lng: 11.5820, population: 1472000 },
    { name: 'Milan', country: 'Italy', lat: 45.4642, lng: 9.1900, population: 1352000 },
    { name: 'Prague', country: 'Czech Republic', lat: 50.0755, lng: 14.4378, population: 1309000 },
    { name: 'Brussels', country: 'Belgium', lat: 50.8503, lng: 4.3517, population: 1198000 },
    { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041, population: 872757 },
    { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686, population: 975904 },
    { name: 'Dublin', country: 'Ireland', lat: 53.3498, lng: -6.2603, population: 544107 },
    { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393, population: 504718 },
    { name: 'Athens', country: 'Greece', lat: 37.9838, lng: 23.7275, population: 664046 },
    { name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lng: 12.5683, population: 602481 },
    { name: 'Oslo', country: 'Norway', lat: 59.9139, lng: 10.7522, population: 693494 },
    { name: 'Helsinki', country: 'Finland', lat: 60.1699, lng: 24.9384, population: 653835 },
    { name: 'Zurich', country: 'Switzerland', lat: 47.3769, lng: 8.5417, population: 415367 },
    { name: 'Manchester', country: 'UK', lat: 53.4808, lng: -2.2426, population: 553230 },
    { name: 'Birmingham', country: 'UK', lat: 52.4862, lng: -1.8904, population: 1149000 },
    { name: 'Lyon', country: 'France', lat: 45.7640, lng: 4.8357, population: 513275 },
    { name: 'Marseille', country: 'France', lat: 43.2965, lng: 5.3698, population: 861635 },
    { name: 'Naples', country: 'Italy', lat: 40.8518, lng: 14.2681, population: 959574 },

    // North America (25 cities)
    { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, population: 8336817 },
    { name: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437, population: 3979576 },
    { name: 'Chicago', country: 'USA', lat: 41.8781, lng: -87.6298, population: 2693976 },
    { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, population: 2956024 },
    { name: 'Houston', country: 'USA', lat: 29.7604, lng: -95.3698, population: 2320268 },
    { name: 'Phoenix', country: 'USA', lat: 33.4484, lng: -112.0740, population: 1680992 },
    { name: 'Philadelphia', country: 'USA', lat: 39.9526, lng: -75.1652, population: 1584064 },
    { name: 'San Antonio', country: 'USA', lat: 29.4241, lng: -98.4936, population: 1547253 },
    { name: 'San Diego', country: 'USA', lat: 32.7157, lng: -117.1611, population: 1423851 },
    { name: 'Dallas', country: 'USA', lat: 32.7767, lng: -96.7970, population: 1343573 },
    { name: 'Montreal', country: 'Canada', lat: 45.5017, lng: -73.5673, population: 1762949 },
    { name: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207, population: 675218 },
    { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, population: 9209944 },
    { name: 'Guadalajara', country: 'Mexico', lat: 20.6597, lng: -103.3496, population: 1495182 },
    { name: 'Monterrey', country: 'Mexico', lat: 25.6866, lng: -100.3161, population: 1135512 },
    { name: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194, population: 883305 },
    { name: 'Seattle', country: 'USA', lat: 47.6062, lng: -122.3321, population: 753675 },
    { name: 'Denver', country: 'USA', lat: 39.7392, lng: -104.9903, population: 727211 },
    { name: 'Boston', country: 'USA', lat: 42.3601, lng: -71.0589, population: 692600 },
    { name: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918, population: 467963 },
    { name: 'Atlanta', country: 'USA', lat: 33.7490, lng: -84.3880, population: 498044 },
    { name: 'Las Vegas', country: 'USA', lat: 36.1699, lng: -115.1398, population: 641903 },
    { name: 'Detroit', country: 'USA', lat: 42.3314, lng: -83.0458, population: 639111 },
    { name: 'Ottawa', country: 'Canada', lat: 45.4215, lng: -75.6972, population: 1017449 },
    { name: 'Calgary', country: 'Canada', lat: 51.0447, lng: -114.0719, population: 1336000 },

    // South America (15 cities)
    { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, population: 12325000 },
    { name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816, population: 3054300 },
    { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729, population: 6748000 },
    { name: 'Lima', country: 'Peru', lat: -12.0464, lng: -77.0428, population: 9751717 },
    { name: 'Bogotá', country: 'Colombia', lat: 4.7110, lng: -74.0721, population: 7674366 },
    { name: 'Santiago', country: 'Chile', lat: -33.4489, lng: -70.6693, population: 5614000 },
    { name: 'Caracas', country: 'Venezuela', lat: 10.4806, lng: -66.9036, population: 2082000 },
    { name: 'Belo Horizonte', country: 'Brazil', lat: -19.9167, lng: -43.9345, population: 2722000 },
    { name: 'Medellín', country: 'Colombia', lat: 6.2442, lng: -75.5812, population: 2529000 },
    { name: 'Quito', country: 'Ecuador', lat: -0.1807, lng: -78.4678, population: 1978376 },
    { name: 'Guayaquil', country: 'Ecuador', lat: -2.1894, lng: -79.8891, population: 2650000 },
    { name: 'Montevideo', country: 'Uruguay', lat: -34.9011, lng: -56.1645, population: 1319108 },
    { name: 'Cali', country: 'Colombia', lat: 3.4516, lng: -76.5320, population: 2228000 },
    { name: 'Curitiba', country: 'Brazil', lat: -25.4290, lng: -49.2671, population: 1948626 },
    { name: 'Recife', country: 'Brazil', lat: -8.0476, lng: -34.8770, population: 1653000 },

    // Africa (20 cities)
    { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, population: 21323000 },
    { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792, population: 15388000 },
    { name: 'Kinshasa', country: 'DR Congo', lat: -4.4419, lng: 15.2663, population: 14342000 },
    { name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lng: 28.0473, population: 5782747 },
    { name: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219, population: 4397073 },
    { name: 'Casablanca', country: 'Morocco', lat: 33.5731, lng: -7.5898, population: 3359818 },
    { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lng: 18.4241, population: 4618000 },
    { name: 'Alexandria', country: 'Egypt', lat: 31.2001, lng: 29.9187, population: 5200000 },
    { name: 'Addis Ababa', country: 'Ethiopia', lat: 9.0320, lng: 38.7469, population: 3604000 },
    { name: 'Dar es Salaam', country: 'Tanzania', lat: -6.7924, lng: 39.2083, population: 6702000 },
    { name: 'Abidjan', country: 'Ivory Coast', lat: 5.3600, lng: -4.0083, population: 5200000 },
    { name: 'Khartoum', country: 'Sudan', lat: 15.5007, lng: 32.5599, population: 5274321 },
    { name: 'Accra', country: 'Ghana', lat: 5.6037, lng: -0.1870, population: 2291352 },
    { name: 'Algiers', country: 'Algeria', lat: 36.7538, lng: 3.0588, population: 3415811 },
    { name: 'Dakar', country: 'Senegal', lat: 14.7167, lng: -17.4677, population: 2646503 },
    { name: 'Tunis', country: 'Tunisia', lat: 36.8065, lng: 10.1815, population: 2365000 },
    { name: 'Durban', country: 'South Africa', lat: -29.8587, lng: 31.0218, population: 3720953 },
    { name: 'Luanda', country: 'Angola', lat: -8.8390, lng: 13.2894, population: 8300000 },
    { name: 'Kampala', country: 'Uganda', lat: 0.3476, lng: 32.5825, population: 1680600 },
    { name: 'Rabat', country: 'Morocco', lat: 34.0209, lng: -6.8416, population: 1932000 },

    // Oceania (10 cities)
    { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, population: 5312163 },
    { name: 'Melbourne', country: 'Australia', lat: -37.8136, lng: 144.9631, population: 5078193 },
    { name: 'Brisbane', country: 'Australia', lat: -27.4698, lng: 153.0251, population: 2514184 },
    { name: 'Perth', country: 'Australia', lat: -31.9505, lng: 115.8605, population: 2085973 },
    { name: 'Auckland', country: 'New Zealand', lat: -36.8485, lng: 174.7633, population: 1657000 },
    { name: 'Adelaide', country: 'Australia', lat: -34.9285, lng: 138.6007, population: 1376601 },
    { name: 'Wellington', country: 'New Zealand', lat: -41.2865, lng: 174.7762, population: 215400 },
    { name: 'Gold Coast', country: 'Australia', lat: -28.0167, lng: 153.4000, population: 679127 },
    { name: 'Canberra', country: 'Australia', lat: -35.2809, lng: 149.1300, population: 462213 },
    { name: 'Christchurch', country: 'New Zealand', lat: -43.5321, lng: 172.6362, population: 381500 },
];

// Get cities count by region
export function getCitiesByRegion(): Record<string, number> {
    const regions: Record<string, number> = {
        'Asia': 0,
        'Europe': 0,
        'North America': 0,
        'South America': 0,
        'Africa': 0,
        'Oceania': 0,
    };

    // This is a simplified categorization
    const asianCountries = ['Pakistan', 'India', 'China', 'Japan', 'South Korea', 'Indonesia', 'Thailand', 'Vietnam', 'Singapore', 'Malaysia', 'Philippines', 'Myanmar', 'Cambodia', 'Turkey', 'Iran', 'Iraq', 'Saudi Arabia', 'UAE', 'Israel', 'Lebanon', 'Jordan', 'Kuwait', 'Qatar', 'Oman', 'Syria'];
    const europeanCountries = ['Russia', 'UK', 'Germany', 'Spain', 'Italy', 'France', 'Austria', 'Poland', 'Hungary', 'Czech Republic', 'Belgium', 'Netherlands', 'Sweden', 'Ireland', 'Portugal', 'Greece', 'Denmark', 'Norway', 'Finland', 'Switzerland'];
    const northAmericanCountries = ['USA', 'Canada', 'Mexico'];
    const southAmericanCountries = ['Brazil', 'Argentina', 'Peru', 'Colombia', 'Chile', 'Venezuela', 'Ecuador', 'Uruguay'];
    const africanCountries = ['Egypt', 'Nigeria', 'DR Congo', 'South Africa', 'Kenya', 'Morocco', 'Ethiopia', 'Tanzania', 'Ivory Coast', 'Sudan', 'Ghana', 'Algeria', 'Senegal', 'Tunisia', 'Angola', 'Uganda'];
    const oceaniaCountries = ['Australia', 'New Zealand'];

    WORLD_CITIES.forEach(city => {
        if (asianCountries.includes(city.country)) regions['Asia']++;
        else if (europeanCountries.includes(city.country)) regions['Europe']++;
        else if (northAmericanCountries.includes(city.country)) regions['North America']++;
        else if (southAmericanCountries.includes(city.country)) regions['South America']++;
        else if (africanCountries.includes(city.country)) regions['Africa']++;
        else if (oceaniaCountries.includes(city.country)) regions['Oceania']++;
    });

    return regions;
}

// Frontend/src/pages/pujaDetails/ServiceData.jsx

const services = [
    {
        id: 1,
        name: "Satya Narayan",
        description: "Performed for well-being, prosperity, and happiness, seeking blessings from Lord Satya Narayan.",
        details: [
            "1. Remove Sufferings and Past Sins",
            "2. Purify the Mind and Soul (by upholding Truth)",
            "3. Bring Positive Energy and Fulfillment of Desires",
            "4. Seek Blessings of Wealth and Wellbeing (from Lord Vishnu)",
            "5. Ensure Harmony, Peace, and Prosperity"
        ],
        image: "images/Satyanarayan.jpg",
        price: "₹1099/-",
    },    
    {
        id: 2,
        name: "Bhumi Pujan",
        description: "Performed to honor and seek blessings from Mother Earth before starting construction, ensuring safety and prosperity.",
        details: [
            "1. Remove Vaastu Doshas & Negative Energy (from the land)",
            "2. Purify the Space & Elements (The land/site)",
            "3. Bring Positive Energy & Auspiciousness (for construction)",
            "4. Seek Blessings (of Bhumi Devi, Ganesha, Vastu Purusha)",
            "5. Ensure Harmony and Prosperity (for future residents)"
        ],
        image: "images/BhumiPujan.jpg",
        price: "₹999/-",
    },
    {
        id: 3,
        name: "Griha Pravesh",
        description: "Performed before entering a new home to purify the space and invite happiness, peace, and prosperity.",
        details: [
            "1. Remove Vaastu Doshas & Negative Energy",
            "2. Purify the Space & Elements",
            "3. Bring Positive Energy & Auspiciousness",
            "4. Seek Blessings for Protection & Prosperity",
            "5. Ensure Harmony, Peace, and Prosperity"
        ],
        image: "images/GrihaPravesh.png",
        price: "₹999/-",
    },
    {
        id: 4,
        name: "Vaastu Shanti",
        description: "Performed to remove negative energies, balance the space, and bring peace and prosperity",
        purpose: "Purpose of Vaastu Shanti",
        details: [
            "1. Remove Vaastu Doshas",
            "2. Purify the Space",
            "3. Bring Positive Energy",
            "4. Seek Blessings",
            "5. Ensure Harmony and Prosperity"
        ],
        image: "images/VastuShanti.png",
        price: "₹1599/-",
    },
    {
        id: 5,
        name: "Ganesh Puja",
        description: "Performed to remove obstacles and bring success, wisdom, and prosperity.",
        details: [
            "1. Remove Obstacles (Vighnaharta) for smooth beginnings",
            "2. Purify the Soul, Mind, and surrounding Environment",
            "3. Bring Positive Energy and an Auspicious start to ventures",
            "4. Seek Blessings for Wisdom, Intellect, and Knowledge",
            "5. Ensure Harmony, Peace, and overall Family Prosperity"
        ],
        image: "images/GaneshPuja.jpeg",
        price: "₹1499/-",
    },
    {
        id: 6,
        name: "Laghu Rudra Puja",
        description: "Performed to invoke Lord Shiva’s blessings for peace, protection, and spiritual upliftment.",

        details: [
            "1. Attain Divine Grace and Blessings of Lord Shiva (Rudra).",
            "2. Remove Malefic Effects of Planets (Navgraha Doshas).",
            "3. Ensure Health, Wealth, Prosperity, and Longevity.",
            "4. Get Relief and Protection from Diseases and Ailments.",
            "5. Improve Relationships, Career, and eliminate Fear of all kinds."
        ],
        image: "images/LaghuRudra.jpeg",
        price: "₹1999/-",
    },
    {
        id: 7,
        name: "Lakshmi Puja",
        description: "Performed for wealth, prosperity, and blessings from Goddess Lakshmi.",
        details: [
            "1. Remove Poverty, Obstacles, and Financial Worries.",
            "2. Purify the Home and Environment to attract Abundance and Purity.",
            "3. Bring Good Fortune, Success, and Material Wealth.",
            "4. Seek Blessings for Business Growth, Career Success, and Stability.",
            "5. Ensure Health, Happiness, and Spiritual Prosperity (Dharma)."
        ],
        image: "images/LaxmiPuja.jpeg",
        price: "₹1999/-",
    },
    {
        id: 8,
        name: "Mangalagaur Puja",
        description: "Performed to bless newlyweds with marital harmony, happiness, and a prosperous married life.",
        details: [
            "1. Ensure the Husband's Long Life and Safety.",
            "2. Mitigate Marital Disputes and strengthen conjugal Love.",
            "3. Remove Malefic Effects of Mangal (Mars) or Manglik Dosha.",
            "4. Seek Blessings for Fertility, Good Health, and Progeny.",
            "5. Attain Unbroken Good Fortune (Akhand Saubhāgya) and Family Harmony."
        ],
        image: "images/MangalagaurPuja.jpeg",
        price: "₹2499/-",
    },
    {
        id: 9,
        name: "Naming Ceremony Puja",
        description: "Performed to bless the newborn with health, happiness, and a prosperous life.",
        details: [
            "1. Establish the Child's Identity and Social Acceptance.",
            "2. Purify the Mother and Child after the post-birth confinement period (Sutika).",
            "3. Bring Positive Vibrations and Alignment with Cosmic Forces.",
            "4. Seek Blessings from Deities, Ancestors, and Elders for Longevity.",
            "5. Ensure a Prosperous Future and Positive Personality Development."
        ],
        image: "images/NamingCeremony.png",
        price: "₹999/-",
    },
    {
        id: 10,
        name: "Navchandi Puja",
        description: "Performed to seek the blessings of Goddess Durga for protection, prosperity, and spiritual well-being.",
        details: [
            "1. Remove all Sufferings, Obstacles, and Evil Influences (Black Magic).",
            "2. Mitigate Malefic Effects of Navgrahas (Planets) and clear Doshas.",
            "3. Bring Power, Wealth, Success, and Fulfillment of all Worldly Desires.",
            "4. Seek the Divine Grace and Protection of Goddess Durga (Chandi).",
            "5. Ensure Purity of Mind, Body, and Soul, leading to Inner Peace and Salvation."
        ],
        image: "images/NavchandiHavan.jpg",
        price: "₹1599/-",
    },
    {
        id: 11,
        name: "Rudrabhishek Puja",
        description: "Performed to invoke Lord Shiva’s blessings for health, peace, and removal of negative energies.",
        details: [
            "1. Remove Obstacles, Negativity, and Evil Forces from life.",
            "2. Purify the Mind, Body, and Soul, and cleanse past Sins/Karmas.",
            "3. Bring Peace, Harmony, Wealth, and Spiritual Upliftment.",
            "4. Seek Protection and Blessings from Lord Shiva (Rudra) for longevity.",
            "5. Eliminate Malefic Planetary Effects (Doshas) from the horoscope."
        ],
        image: "images/Rudrabhishek.jpeg",
        price: "₹1199/-",
    },
    {
        id: 12,
        name: "Upayan(Munj) Puja",
        description: "Performed to mark the sacred thread ceremony, blessing the child with wisdom, knowledge, and spiritual growth.",
        details: [
            "1. Mark the 'Second Birth' (Dvija) into spiritual and intellectual life.",
            "2. Purify the individual and absolve sins from unrefined childhood.",
            "3. Bring Initiation into Vedic Study and the sacred Gayatri Mantra.",
            "4. Establish Discipline, Moral Virtue, and a sense of responsibility (Dharma).",
            "5. Seek Blessings for Knowledge, Longevity, and eventual Spiritual Liberation (Moksha)."
        ],
        image: "images/UpnayanPuja.jpeg",
        price: "₹2999/-",
    },
    {
        id: 13,
        name: "Vardhishnu Puja",
        description: "Performed to seek Lord Vishnu’s blessings for long life, prosperity, and overall well-being.",
        details: [
            "1. Remove Obstacles, Evil Influences, and Negative Karmas.",
            "2. Purify the mind and surroundings to align with positive energies.",
            "3. Bring Continuous Increase in Prosperity (Vardhana) and Abundance.",
            "4. Seek Blessings for Protection, Harmony, and Stability (from Lord Vishnu).",
            "5. Ensure Success, Fulfillment of Desires, and Spiritual Growth."
        ],
        image: "images/VardhiushnuPuja.jpg",
        price: "₹1499/-",
    },
    {
        id: 14,
        name: "Wedding",
        description: "Performed to bless the couple with a happy, prosperous, and harmonious married life.",
        details: [
            "1. Mark the beginning of the Grihastha Ashram (Householder Stage).",
            "2. Purify the couple to jointly pursue the four aims of life (Purusharthas).",
            "3. Bring a Spiritual and Karmic Union between two souls for seven lifetimes.",
            "4. Seek Blessings from Ganesha and Agni (Fire God) for prosperity and fidelity.",
            "5. Ensure Progeny, Family Harmony, and the fulfillment of worldly desires (Kama)."
        ],
        image: "images/WeddingPuja.png",
        price: "₹7999/-",
    },
    {
        id: 15,
        name: "Javal Puja",
        description: "Performed to bless newlyweds with love, harmony, and a prosperous married life.",
        details: [
            "1. Cleanse the Child of Past Life's Karma and Impurities.",
            "2. Purify the Body, Mind, and Soul for a fresh start in the current life.",
            "3. Bring Good Health, Longevity, and Blessings for physical strength.",
            "4. Seek Blessings for Wisdom, Intellectual Growth, and Moral Development.",
            "5. Promote proper Hair Growth and regulate the body's energy/temperature."
        ],
        image: "images/JavlPuja.png",
        price: "₹699/-",
    },
    {
        id: 16,
        name: "Engagement Ceremony",
        description: "Performed to bless the couple with a happy, prosperous, and harmonious journey ahead.",
        details: [
            "1. Formalize the Agreement of Marriage between the two families.",
            "2. Remove Obstacles by invoking Lord Ganesha for a smooth wedding process.",
            "3. Bring Divine Blessings and an Auspicious start to the union.",
            "4. Strengthen the Trust, Acceptance, and Commitment between the two families.",
            "5. Ensure a Prosperous, Happy, and Harmonious future for the betrothed couple."
        ],
        image: "images/EngagementPuja.jpeg",
        price: "₹3999/-",
    }
];

export default services;
import React, { useState, useEffect } from 'react';
import { useStore, type Product } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ArrowLeft, Star, ShieldCheck, HelpCircle, Truck } from 'lucide-react';

const getProductRichSectionsData = (productName: string) => {
  const name = productName.toUpperCase();

  if (name.includes('WHEY') || name.includes('PROTEIN')) {
    return {
      useCases: [
        { title: 'Post-Workout Recovery', description: 'Drink 1 scoop within 30 minutes of training to halt muscle protein breakdown and kickstart repair.' },
        { title: 'High-Protein Breakfast Boost', description: 'Mix 1 scoop with oatmeal or smoothies to start your morning with a massive 27g of pure isolate protein.' },
        { title: 'Lean Snack Alternative', description: 'A fast-digesting, zero-sugar, low-carb shake that keeps you full for hours during cutting phases.' }
      ],
      ingredients: [
        { name: 'Whey Protein Isolate', description: 'Premium USA-sourced micro-filtered isolate yielding 90%+ pure protein with zero lactose or gluten.' },
        { name: 'BCAAs (L-Leucine, L-Isoleucine, L-Valine)', description: 'Amino acid matrix that directly triggers muscle protein synthesis and speeds up recovery.' },
        { name: 'DigeZyme® Multi-Enzyme', description: 'Custom digestive enzyme blend containing amylase, protease, lactase, lipase, and cellulase for zero bloating.' },
        { name: 'Glutamic Acid', description: 'Abundant amino acid that helps replenish cellular energy stores and repairs intestinal lining.' }
      ],
      powerScoop: [
        { name: 'Protein', value: '27g', percent: 90 },
        { name: 'BCAAs', value: '5.26g', percent: 75 },
        { name: 'Carbohydrates', value: '0.8g', percent: 10 },
        { name: 'Fat', value: '0.2g', percent: 5 },
        { name: 'Lactose', value: '0g', percent: 0 }
      ]
    };
  }

  if (name.includes('PRE-WORKOUT') || name.includes('DOUBLE SHOT')) {
    return {
      useCases: [
        { title: 'High-Intensity Strength Booster', description: 'Consume 1 scoop 20-30 minutes before heavy lifting. Restores ATP and fuels absolute muscle contractility.' },
        { title: 'Cardio Endurance Kick', description: 'Take 1/2 scoop before intensive high-intensity interval training or circuit training. Prevents fatigue.' },
        { title: 'Mental Focus Tunnel', description: 'Provides clean jitter-free cognitive tunnel focus to block out ambient distraction during heavy working sets.' }
      ],
      ingredients: [
        { name: 'L-Citrulline Malate (2:1)', description: 'Forces skin-splitting pumps by expanding vascular pathways and boosting nitric oxide production.' },
        { name: 'Beta-Alanine', description: 'Buffers lactic acid accumulation in muscle cells, delaying muscular fatigue and allowing extra reps.' },
        { name: 'Caffeine Anhydrous', description: 'Maximizes cellular energy output, enhances focus, and triggers an aggressive strength surge.' },
        { name: 'L-Tyrosine', description: 'Cognitive enhancer that maintains mental focus and alertness under extreme physical stress.' },
        { name: 'BioPerine®', description: 'Black pepper extract that significantly enhances the bioavailability and absorption of other active ingredients.' }
      ],
      powerScoop: [
        { name: 'L-Citrulline Malate', value: '6000mg', percent: 95 },
        { name: 'Beta-Alanine', value: '3200mg', percent: 85 },
        { name: 'Caffeine Anhydrous', value: '300mg', percent: 65 },
        { name: 'L-Tyrosine', value: '1000mg', percent: 50 },
        { name: 'BioPerine®', value: '5mg', percent: 15 }
      ]
    };
  }

  if (name.includes('CREATINE')) {
    return {
      useCases: [
        { title: 'Post-Workout ATP Charge', description: 'Stack 1 scoop (3g) with your whey protein shake post-workout to rapidly replenish glycogen and muscle ATP.' },
        { title: 'Intra-Workout Power Spike', description: 'Mix with a carb-rich beverage during training to maintain maximal force production and cell hydration.' },
        { title: 'Daily Maintenance Dose', description: 'Take 1 scoop every single day at the same time to maintain full muscle creatine saturation.' }
      ],
      ingredients: [
        { name: 'Micronized Creatine Monohydrate', description: '100% pure, 200-mesh fine powder that dissolves instantly and maximizes muscle cell volume.' }
      ],
      powerScoop: [
        { name: 'Creatine Monohydrate', value: '3g', percent: 100 },
        { name: 'Yield Purity', value: '100%', percent: 100 },
        { name: 'Fillers / Additives', value: '0%', percent: 0 }
      ]
    };
  }

  if (name.includes('EAA') || name.includes('BCAA')) {
    return {
      useCases: [
        { title: 'Intra-Workout Hydration Shield', description: 'Sip throughout your workout to supply essential aminos directly to working muscle fibers, blocking fatigue.' },
        { title: 'All-Day Anabolic Hydrator', description: 'Drink between meals to maintain muscle protein synthesis on off-days while supporting cellular hydration.' },
        { title: 'Fasted Cardio Recovery', description: 'Take before cardio sessions to shield muscle tissue from catabolism while operating in a fasted state.' }
      ],
      ingredients: [
        { name: 'Essential Amino Acids (EAAs)', description: 'All 9 essential aminos that the body cannot synthesize, vital for initiating muscle fiber repair.' },
        { name: 'Branched-Chain Amino Acids (BCAAs)', description: '2:1:1 ratio L-Leucine, L-Isoleucine, and L-Valine that trigger recovery pathways and enhance energy.' },
        { name: 'Coconut Water Powder', description: 'Rich natural source of key electrolytes (potassium, sodium) that prevents cramping and rehydrates cells.' },
        { name: 'Taurine', description: 'Enhances cellular volume, speeds up muscle clearance, and boosts athletic stamina.' }
      ],
      powerScoop: [
        { name: 'EAAs', value: '7g', percent: 85 },
        { name: 'BCAAs', value: '5g', percent: 75 },
        { name: 'Coconut Water Powder', value: '500mg', percent: 50 },
        { name: 'Taurine', value: '1000mg', percent: 60 },
        { name: 'Electrolytes', value: '220mg', percent: 40 }
      ]
    };
  }

  if (name.includes('CITRULLINE')) {
    return {
      useCases: [
        { title: 'Pre-Workout Pump Booster', description: 'Add 1 scoop (2g) to your standard pre-workout shake to boost nitric oxide production and force vascular pumps.' },
        { title: 'Heavy Set Recovery Enhancer', description: 'Drink during training to help clear ammonia and lactic acid, squeezing out extra repetitions on heavy sets.' },
        { title: 'Stamina Support', description: 'Take before aerobic or high-rep training to support peak oxygen delivery to working muscle tissues.' }
      ],
      ingredients: [
        { name: 'L-Citrulline Malate (2:1 Ratio)', description: 'Clinical combination of L-Citrulline and Malate (malic acid) that maximizes vasodilation and ATP production.' }
      ],
      powerScoop: [
        { name: 'Citrulline Malate (2:1)', value: '2g', percent: 100 },
        { name: 'Active Citrulline Yield', value: '1350mg', percent: 85 },
        { name: 'Malic Acid Yield', value: '650mg', percent: 65 },
        { name: 'Fillers / Additives', value: '0%', percent: 0 }
      ]
    };
  }

  if (name.includes('BURNER') || name.includes('FAT')) {
    return {
      useCases: [
        { title: 'Morning Fasted Met-Boost', description: 'Take 1 serving in the morning on an empty stomach to kickstart thermogenesis and fatty acid mobilization.' },
        { title: 'Pre-Cardio Energy Surge', description: 'Consume 30 minutes before cardio to increase core body temperature, sweat rate, and athletic energy.' },
        { title: 'Mid-Day Appetite Shield', description: 'Helps manage cravings and sustains active focus during calorie-restricted diets.' }
      ],
      ingredients: [
        { name: 'L-Carnitine L-Tartrate', description: 'Assists in transporting long-chain fatty acids into mitochondria to be oxidized for cellular energy.' },
        { name: 'Green Tea Extract', description: 'Rich in EGCG catechins that synergistically support thermogenesis and fat oxidation.' },
        { name: 'Caffeine Anhydrous', description: 'Elevates mental alertness, boosts metabolic rate, and sparks high-intensity workout energy.' },
        { name: 'Garcinia Cambogia', description: 'Contains HCA (hydroxycitric acid) which helps regulate appetite and inhibit fat storage enzymes.' }
      ],
      powerScoop: [
        { name: 'L-Carnitine', value: '1000mg', percent: 90 },
        { name: 'Green Tea Extract', value: '250mg', percent: 65 },
        { name: 'Caffeine', value: '200mg', percent: 50 },
        { name: 'Garcinia Cambogia', value: '150mg', percent: 40 },
        { name: 'Black Pepper Extract', value: '5mg', percent: 15 }
      ]
    };
  }

  // Default is Massive Mass Gainer
  return {
    useCases: [
      { title: 'Post-Workout Caloric Surge', description: 'Mix 3 scoops with cold water or milk to immediately flood your body with calorie-dense building blocks.' },
      { title: 'Mid-Day Shake Meal', description: 'Consume between lunch and dinner to add clean calories, helping hardgainers hit weight goals.' },
      { title: 'Nighttime Mass Shield', description: 'Drink 1 hour before bed to support muscle growth and recovery during sleep cycles.' }
    ],
    ingredients: [
      { name: 'Protein Blend (Whey + Casein)', description: 'Multi-phase release protein providing fast amino rushes and muscle protein synthesis.' },
      { name: 'Complex Carbohydrates', description: 'Low-glycemic carbs that replenish glycogen stores without triggering unwanted blood sugar spikes.' },
      { name: 'Digestive Enzymes', description: 'Added Protease and Lactase that assist in the breakdown of proteins and milk sugars for smooth digestion.' },
      { name: 'Creatine Monohydrate', description: 'Stack helper that supports raw power generation and speeds up muscular size additions.' }
    ],
    powerScoop: [
      { name: 'Calories', value: '374 kcal', percent: 80 },
      { name: 'Protein', value: '20g', percent: 70 },
      { name: 'Carbohydrates', value: '65g', percent: 90 },
      { name: 'Fat', value: '2.5g', percent: 30 },
      { name: 'Enzymes', value: '150mg', percent: 40 }
    ]
  };
};

interface ProductDetailViewProps {
  productId: string | null;
  comboId: string | null;
  onBack: () => void;
  onNavigateToProduct: (id: string) => void;
}

const getNutritionImage = (productName: string): string => {
  const name = productName.toUpperCase();
  if (name.includes('DOUBLE SHOT PRE-WORKOUT') || name.includes('PRE-WORKOUT')) {
    return '/images/preworkout_nutrition.png';
  }
  if (name.includes('CITRULLINE')) {
    return '/images/citrulline_nutrition.png';
  }
  if (name.includes('ISO WHEY TANK') || name.includes('WHEY') || name.includes('PROTEIN')) {
    return '/images/whey_nutrition.png';
  }
  if (name.includes('EAA') || name.includes('BCAA')) {
    return '/images/eaa_nutrition.png';
  }
  return '/images/general_nutrition.png';
};

const getProductLongDescription = (productName: string): string => {
  const name = productName.toUpperCase();
  if (name.includes('WHEY') || name.includes('PROTEIN')) {
    return `GYMMM TANK WHEY ISOLATE is developed keeping in mind the ever-changing needs of fitness enthusiasts. It uses the purest protein - Whey Protein Isolate which is fat free, carb free and lactose free. Loaded with the profusion of most premium isolates, it helps build muscles without any unwanted weight gain.\n\nDeveloped using the best quality Whey Protein Isolate imported from USA. It is ultra-filtered for fast digestion and easy absorption into the muscles by the aid of an elite amino acid profile.\n\nIt is extremely good in taste, mixes instantly with water or milk, and helps in building lean muscle mass while boosting recovery speeds after high-intensity training. Features DigeZyme® digestive enzymes for zero bloating.`;
  }
  if (name.includes('PRE-WORKOUT') || name.includes('DOUBLE SHOT')) {
    return `GYMMM TANK DOUBLE SHOT PRE-WORKOUT is an extreme high-stimulant training formula engineered to push your mental focus and muscular performance past all historical thresholds.\n\nFormulated with 6000mg of L-Citrulline Malate for massive blood flow expansion, and 300mg of Caffeine Anhydrous to maximize cellular energy output, it triggers an instant surge in exercise output.\n\nL-Tyrosine adds cognitive tunnel vision, while Beta-Alanine delays the onset of lactic acid buildup. Perfect for advanced athletes looking to crush hit plateaus and go to the absolute extremes.`;
  }
  if (name.includes('CREATINE')) {
    return `GYMMM TANK CREATINE CHARGE delivers 100% pure, ultra-micronized creatine monohydrate to elevate your muscle volumization and power outputs.\n\nConsisting of 200-mesh premium grade powder, it dissolves instantly in water, juice, or your protein shake without leaving grainy residues. Creatine increases the body's phosphocreatine reserves, facilitating rapid ATP regeneration to power high-intensity lifts.\n\nConsistent daily usage accelerates dry muscle fiber growth, enhances cellular hydration, and increases peak muscular torque.`;
  }
  if (name.includes('EAA') || name.includes('BCAA')) {
    return `GYMMM TANK EAA + BCAA RECOVERY FUEL is a premium intra-workout hydration stack containing all 9 essential amino acids in clinical proportions.\n\nPowered by 7g of EAAs and 5g of BCAAs, it acts as an anabolic shield to prevent muscle catabolism during heavy training. The formula is enriched with Coconut Water Powder and Taurine to maintain electrolyte balance, prevent muscle cramping, and accelerate cellular hydration.\n\nCompletely sugar-free, it delivers clean athletic fuel to repair muscle tissue as you lift.`;
  }
  if (name.includes('BURNER') || name.includes('FAT')) {
    return `GYMMM TANK SHRED TANK BURNER is an advanced thermogenic fat-loss formula designed to accelerate caloric expenditure, boost metabolic rate, and support healthy weight management.\n\nFormulated with L-Carnitine L-Tartrate, Green Tea Extract, and Garcinia Cambogia, it assists in mobilizing stored fatty acids and converting them into direct workout energy.\n\nPerfect for weight management cycles, it also includes a mental focus blend to sustain training intensity during calorie-restricted diets.`;
  }
  if (name.includes('CITRULLINE')) {
    return `GYMMM TANK PURE CITRULLINE MALATE provides premium 2:1 ratio L-Citrulline Malate with zero fillers, flavorings, or processing additives.\n\nBy increasing nitric oxide production, it triggers arterial relaxation and vascular expansion, forcing skin-splitting muscle pumps and maximizing nutrient delivery to working muscle fibers.\n\nAdditionally, it aids in clearing metabolic waste products like ammonia, delaying the onset of muscular fatigue. Unflavored and highly soluble, it stacks perfectly into any pre- or intra-workout shake.`;
  }
  return `GYMMM TANK MASSIVE MASS GAINER is a calorie-dense mass-building formula designed for hardgainers and athletes looking to add serious size and strength.\n\nEvery serving delivers a high-yield blend of fast and slow digesting proteins stacked with complex carbohydrates to fuel recovery and glycogen replenishment.\n\nFortified with digestive enzymes like Protease and Amylase, it facilitates clean absorption and prevents digestive distress. Mix with whole milk for an extra caloric surge to hit weight gain milestones.`;
};

const getDetailedInfo = (productName: string) => {
  const name = productName.toUpperCase();

  if (name.includes('PRE-WORKOUT')) {
    return {
      benefits: [
        "⚡ EXPLOSIVE ENERGY: 300mg Caffeine anhydrous pushes workout capacity to the absolute limits.",
        "💪 VASCULAR PUMPS: 6000mg L-Citrulline Malate forces skin-splitting muscle pumps.",
        "⏳ LASER FOCUS: Delivers cognitive tunnel vision for complete lift concentration.",
        "🏋️ MUSCLE ENDURANCE: Beta-alanine buffers lactic acid to squeeze out extra reps."
      ],
      usage: "Mix 1 scoop (12g) in 250-300ml of ice-cold water. Sip 20-30 minutes before stepping onto the gym floor. Do not consume within 6 hours of bedtime. Do not exceed 1 scoop daily.",
      warning: "Contains high caffeine levels. High-intensity workout supplement. Not recommended for beginners or individuals sensitive to stimulants."
    };
  }
  if (name.includes('WHEY') || name.includes('PROTEIN')) {
    return {
      benefits: [
        "🧪 100% PURE ISOLATE: Micro-filtered whey isolate provides elite-grade muscle repair fuel.",
        "🛡️ AMINO LOAD: 11.69g of EAAs and 5.26g of BCAAs per serving to prevent catabolism.",
        "🔬 ZERO STEROIDS: Guaranteed 100% steroid-free and lab tested batch purity.",
        "🍕 DIGESTIVE ENZYMES: Infused with DigeZyme® multi-enzyme complex for zero bloating."
      ],
      usage: "Mix 1 heaping scoop (40g) in 200-250ml of cold water or skimmed milk. Consume within 30 minutes post-workout, or first thing in the morning to fuel protein synthesis.",
      warning: "Contains milk-derived allergens. Store in a cool, dry place."
    };
  }
  if (name.includes('CREATINE')) {
    return {
      benefits: [
        "💥 MUSCLE VOLUMIZATION: Micronized monohydrate floods muscle cells with water weight.",
        "🏋️ EXPLOSIVE POWER: Boosts phosphocreatine reserves to accelerate ATP regeneration.",
        "🔬 MICRONIZED SOLUBILITY: Dissolves instantly in water without leaving gritty deposits.",
        "🧬 MUSCLE GROWTH: Clinically proven to accelerate long-term dry muscle fiber gains."
      ],
      usage: "Mix 1 scoop (3-5g) with water, fruit juice, or your post-workout shake. Drink at least 3-4 liters of water daily while supplementing with creatine.",
      warning: "Ensure adequate daily hydration to protect renal function."
    };
  }
  if (name.includes('EAA') || name.includes('BCAA')) {
    return {
      benefits: [
        "⚡ INTRA-WORKOUT HYDRATION: Packed with premium Coconut Water Powder and Taurine.",
        "🔬 ACCELERATED RECOVERY: Essential Amino Acids repair muscle fibers as you lift.",
        "🛡️ MUSCLE SHIELD: Spares muscle glycogen reserves, preventing catabolism.",
        "🔥 ZERO CARBS: Clean athletic fuel without added sugar, carbs, or empty calories."
      ],
      usage: "Mix 1 scoop (10g) in 300-400ml of cold water. Sip continuously during your training sessions or drink immediately post-workout.",
      warning: "Store tightly sealed to avoid clumping from moisture exposure."
    };
  }
  if (name.includes('BURNER') || name.includes('FAT')) {
    return {
      benefits: [
        "🔥 THERMOGENIC ACTIVATION: Elevates core body temperature to accelerate calorie expenditure.",
        "⚡ APPETITE MITIGATION: Promotes insulin stability, reducing cravings and dietary slips.",
        "🛡️ SHRED STIMULATION: Converts stored adipose lipids into accessible workout fuel.",
        "🧬 SHARP FOCUS: Enhanced cognitive focus matrix to maintain heavy training drives."
      ],
      usage: "Take 1 capsule with a glass of water on an empty stomach in the morning, or 30 minutes before cardo/training. Do not exceed 2 capsules daily.",
      warning: "Stimulant-rich formula. Do not consume within 5 hours of sleep."
    };
  }
  if (name.includes('CITRULLINE')) {
    return {
      benefits: [
        "💥 NITRIC OXIDE FLOOD: Triggers massive arterial expansion for peak muscle vascularity.",
        "⏳ AMMONIA CLEARANCE: Buffers toxic workout bi-products to block muscular fatigue.",
        "🏋️ SOLUBILITY & STRENGTH: Pure Citrulline Malate in a 2:1 ratio for optimal muscle absorption.",
        "🔬 ZERO FILLERS: 100% pure ingredient with zero flavorings, colors, or processing additives."
      ],
      usage: "Mix 1 scoop (2g) with water or stack it directly into your pre-workout shake 30 minutes before hitting the weights.",
      warning: "Slightly acidic taste. Stack with a flavored shake for optimal taste."
    };
  }
  return {
    benefits: [
      "💪 MASSIVE CALORIE LOAD: Designed for hardgainers looking to pack on massive size.",
      "🧪 COMPLEX CARB MATRIX: Sustained energy release to power intense recovery sessions.",
      "🔬 LAB TESTED: Pure, clean sports nutrition formulation without unlisted fillers.",
      "🧬 ENHANCED RECOVERY: Rich in EAAs/BCAAs to fuel immediate protein synthesis."
    ],
    usage: "Mix 2 scoops (100g) with 350-400ml of whole milk or cold water. Consume 1-2 times daily between meals or immediately post-workout.",
    warning: "High calorie formula. Monitor body weight goals regularly."
  };
};

const getNutrientSummary = (productName: string) => {
  const name = productName.toUpperCase();
  if (name.includes('WHEY') || name.includes('PROTEIN')) {
    return [
      { label: 'PROTEIN', value: '27g' },
      { label: 'BCAAs', value: '5.26g' },
      { label: 'CALORIES', value: '120 kcal' },
      { label: 'SUGAR', value: '0g' },
      { label: 'SERVINGS', value: '30' }
    ];
  }
  if (name.includes('PRE-WORKOUT')) {
    return [
      { label: 'CAFFEINE', value: '300mg' },
      { label: 'L-CITRULLINE', value: '6000mg' },
      { label: 'BETA-ALANINE', value: '3200mg' },
      { label: 'SUGAR', value: '0g' },
      { label: 'SERVINGS', value: '30' }
    ];
  }
  if (name.includes('CITRULLINE')) {
    return [
      { label: 'CITRULLINE MALATE', value: '2000mg' },
      { label: 'RATIO', value: '2:1' },
      { label: 'CALORIES', value: '0 kcal' },
      { label: 'SUGAR', value: '0g' },
      { label: 'SERVINGS', value: '100' }
    ];
  }
  if (name.includes('EAA') || name.includes('BCAA')) {
    return [
      { label: 'EAAs', value: '7g' },
      { label: 'BCAAs', value: '5g' },
      { label: 'ELECTROLYTES', value: '500mg' },
      { label: 'SUGAR', value: '0g' },
      { label: 'SERVINGS', value: '30' }
    ];
  }
  if (name.includes('CREATINE')) {
    return [
      { label: 'CREATINE MONO', value: '3g' },
      { label: 'PURITY', value: '99.9%' },
      { label: 'CALORIES', value: '0 kcal' },
      { label: 'SUGAR', value: '0g' },
      { label: 'SERVINGS', value: '83' }
    ];
  }
  if (name.includes('BURNER') || name.includes('FAT')) {
    return [
      { label: 'L-CARNITINE', value: '500mg' },
      { label: 'CAFFEINE', value: '200mg' },
      { label: 'GREEN TEA', value: '200mg' },
      { label: 'SUGAR', value: '0g' },
      { label: 'SERVINGS', value: '60' }
    ];
  }
  if (name.includes('GAINER') || name.includes('MASS')) {
    return [
      { label: 'PROTEIN', value: '30g' },
      { label: 'CARBS', value: '140g' },
      { label: 'CALORIES', value: '700 kcal' },
      { label: 'SUGAR', value: '5g' },
      { label: 'SERVINGS', value: '20' }
    ];
  }
  return null;
};

const getIngredientsSpecs = (productName: string) => {
  const name = productName.toUpperCase();
  if (name.includes('WHEY') || name.includes('PROTEIN')) {
    return [
      { key: 'Source', value: 'USA Imported Raw Material' },
      { key: 'Dietary Type', value: '100% Vegetarian' },
      { key: 'Primary Source', value: 'Whey Protein Isolate' },
      { key: 'Protein content', value: '27g per 40g serving (67.5% yield)' },
      { key: 'BCAAs', value: '5.26g per serving' },
      { key: 'EAAs', value: '11.69g per serving' },
      { key: 'Gluten Free', value: 'Yes' },
      { key: 'Allergens', value: 'Contains Milk and Soy (Lecithin)' },
      { key: 'Sweetening Agent', value: 'Sucralose (Zero calorie sweetener)' },
      { key: 'Enzymes', value: 'DigeZyme® Multi-Enzyme Complex' }
    ];
  }
  if (name.includes('PRE-WORKOUT') || name.includes('DOUBLE SHOT')) {
    return [
      { key: 'Dietary Type', value: '100% Vegetarian' },
      { key: 'Caffeine Content', value: '300mg per 12g serving' },
      { key: 'L-Citrulline Malate', value: '6000mg per serving' },
      { key: 'Beta-Alanine', value: '3200mg per serving' },
      { key: 'L-Tyrosine', value: '1000mg per serving' },
      { key: 'Form', value: 'Micronized Powder' },
      { key: 'Banned Substance Free', value: 'Yes' },
      { key: 'Servings per Tub', value: '30 Servings' },
      { key: 'Gluten Free', value: 'Yes' }
    ];
  }
  if (name.includes('CREATINE')) {
    return [
      { key: 'Dietary Type', value: '100% Vegetarian' },
      { key: 'Purity', value: '99.9% Pure Creatine Monohydrate' },
      { key: 'Solubility', value: 'Micronized 200 Mesh Powder' },
      { key: 'Banned Substance Free', value: 'Yes' },
      { key: 'Serving Size', value: '3g' },
      { key: 'Total Servings', value: '83 Servings' },
      { key: 'Added Sugar / Flavor', value: 'None (100% Unflavored)' }
    ];
  }
  if (name.includes('EAA') || name.includes('BCAA')) {
    return [
      { key: 'Dietary Type', value: '100% Vegetarian' },
      { key: 'Total Aminos', value: '12g (7g EAAs, 5g BCAAs)' },
      { key: 'Hydration Matrix', value: 'Coconut Water Powder + Taurine' },
      { key: 'Sugar Content', value: '0g Sugar' },
      { key: 'Form', value: 'Instantized Powder' },
      { key: 'Allergens', value: 'None' },
      { key: 'Servings per Tub', value: '30 Servings' }
    ];
  }
  if (name.includes('BURNER') || name.includes('FAT')) {
    return [
      { key: 'Dietary Type', value: '100% Vegetarian (HPMC Capsule shells)' },
      { key: 'L-Carnitine L-Tartrate', value: '500mg per serving' },
      { key: 'Caffeine Anhydrous', value: '200mg per serving' },
      { key: 'Green Tea Extract', value: '200mg per serving' },
      { key: 'Garcinia Cambogia', value: '150mg per serving' },
      { key: 'Format', value: '60 Veg Capsules' },
      { key: 'Daily Dosage', value: '1-2 Capsules daily' }
    ];
  }
  if (name.includes('CITRULLINE')) {
    return [
      { key: 'Dietary Type', value: '100% Vegetarian' },
      { key: 'L-Citrulline Malate', value: '2000mg (2g) per serving' },
      { key: 'Active Ratio', value: '2:1 (L-Citrulline to Malic Acid)' },
      { key: 'Added Sugar', value: '0g Sugar' },
      { key: 'Total Servings', value: '100 Servings' },
      { key: 'Flavors & Colors', value: 'Zero (Pure Raw Unflavored)' }
    ];
  }
  if (name.includes('GAINER') || name.includes('MASS')) {
    return [
      { key: 'Dietary Type', value: '100% Vegetarian' },
      { key: 'Calories', value: '700 kcal per serving' },
      { key: 'Protein content', value: '30g per serving' },
      { key: 'Carbohydrates', value: '140g per serving' },
      { key: 'Digestive Enzymes', value: 'Added Protease & Amylase' },
      { key: 'Fat content', value: '3g per serving' },
      { key: 'Sweetener', value: 'Sucralose' }
    ];
  }
  return [
    { key: 'Dietary Type', value: '100% Vegetarian' },
    { key: 'Quality Standard', value: 'Premium Grade GMP Certified' },
    { key: 'Banned Substances', value: 'None' }
  ];
};

const getProductFaqs = (productName: string) => {
  const name = productName.toUpperCase();
  if (name.includes('WHEY') || name.includes('PROTEIN')) {
    return [
      {
        q: "What is the best time to consume 100% ISO Whey Tank?",
        a: "The ideal time is within 30 minutes post-workout to kickstart muscle recovery. You can also consume it in the morning to fuel protein synthesis or between major meals."
      },
      {
        q: "Does 100% ISO Whey Tank cause bloating or digestion issues?",
        a: "No. It is infused with DigeZyme® multi-enzyme complex (amylase, protease, lactase, lipase, cellulase) which facilitates quick protein absorption and prevents bloating or stomach upset."
      },
      {
        q: "Is it suitable for lactose intolerant individuals?",
        a: "Since it is a 100% Whey Isolate, most lactose is filtered out. However, if you are extremely sensitive, start with a smaller dose or consult your physician."
      },
      {
        q: "Are the flavorings safe?",
        a: "Absolutely. We use premium, food-grade flavorings and sweeten with sucralose, keeping the formula completely calorie-free from added sugars."
      }
    ];
  }
  if (name.includes('PRE-WORKOUT') || name.includes('DOUBLE SHOT')) {
    return [
      {
        q: "Can beginners use Double Shot Pre-workout?",
        a: "Beginners should start with a half-scoop to assess tolerance due to the high caffeine content (300mg) and potent beta-alanine stimulation."
      },
      {
        q: "Why does my skin itch or tingle after taking this pre-workout?",
        a: "This is a harmless, temporary skin sensation called paresthesia, caused by Beta-Alanine. It is completely safe and usually wears off within 60-90 minutes."
      },
      {
        q: "Can I take it late in the evening?",
        a: "It is not recommended to consume within 6 hours of sleep to avoid interference with sleep quality. Use it for morning or afternoon workouts."
      },
      {
        q: "Can I stack it with other supplements?",
        a: "Yes, it stacks perfectly with Creatine or unflavored Citrulline Malate. Avoid stacking with other stimulant-containing supplements or fat burners."
      }
    ];
  }
  if (name.includes('CREATINE')) {
    return [
      {
        q: "Is a loading phase required for Creatine Charge?",
        a: "A loading phase (20g daily for 5-7 days) is not mandatory. Taking 3-5g consistently every day will fully saturate your muscle cells in 3-4 weeks."
      },
      {
        q: "Can I mix creatine with my pre-workout or whey protein?",
        a: "Yes, it stacks perfectly with pre-workouts, EAAs, or whey protein. It is unflavored and dissolves instantly."
      },
      {
        q: "How much water should I drink while taking creatine?",
        a: "We recommend drinking at least 3-4 liters of water daily to maintain proper hydration and support cellular volumization."
      },
      {
        q: "Do I need to cycle off creatine?",
        a: "No, cycling is not necessary. Creatine is safe for long-term daily consumption in recommended dosages."
      }
    ];
  }
  if (name.includes('EAA') || name.includes('BCAA')) {
    return [
      {
        q: "What is the difference between BCAA and EAA?",
        a: "BCAAs contain 3 amino acids (Leucine, Isoleucine, Valine) that trigger protein synthesis. EAAs contain all 9 essential amino acids which cannot be made by the body and are vital for complete muscle recovery and repair."
      },
      {
        q: "Can I sip EAA during my workouts?",
        a: "Yes, EAA + BCAA Recovery Fuel is designed as an intra-workout drink. The added coconut water powder helps maintain electrolyte levels and prevents dehydration during intense training."
      },
      {
        q: "Is there any added sugar?",
        a: "No. EAA + BCAA Recovery Fuel has 0g of sugar, keeping it clean and calorie-free."
      }
    ];
  }
  if (name.includes('BURNER') || name.includes('FAT')) {
    return [
      {
        q: "How does Shred Tank Burner help in fat loss?",
        a: "It accelerates your metabolic rate, increases energy expenditure through thermogenesis (elevating core temperature), and suppresses appetite cravings."
      },
      {
        q: "Should I take it on rest days?",
        a: "Yes, take 1 capsule in the morning on an empty stomach to maintain a high metabolic rate even on rest days."
      },
      {
        q: "Can I combine it with Double Shot Pre-workout?",
        a: "We do not recommend taking them together at the same time as both contain high stimulant dosages. Space them out by at least 6-8 hours."
      }
    ];
  }
  if (name.includes('CITRULLINE')) {
    return [
      {
        q: "Why is Pure Citrulline Malate unflavored?",
        a: "Unflavored Citrulline is designed to be highly versatile, allowing you to stack it directly into your flavored pre-workout, EAA, or post-workout drink without affecting the taste."
      },
      {
        q: "What does 2:1 ratio mean?",
        a: "It means 2 parts of L-Citrulline amino acid bonded with 1 part of Malic Acid. Malic acid increases energy production (ATP), while L-Citrulline increases Nitric Oxide levels for muscular pumps."
      },
      {
        q: "Should I take Citrulline on non-workout days?",
        a: "It is not strictly necessary, but taking a smaller dose can support cardiovascular circulation and recovery."
      }
    ];
  }
  if (name.includes('GAINER') || name.includes('MASS')) {
    return [
      {
        q: "Who is Massive Mass Gainer suitable for?",
        a: "It is ideal for hardgainers (ectomorphs) who struggle to pack on size, or athletes undergoing bulking cycles requiring high caloric intake."
      },
      {
        q: "Can I use milk instead of water?",
        a: "Yes. Mixing Massive Mass Gainer with whole milk adds significant calories, protein, and calcium, accelerating weight gain progress."
      },
      {
        q: "How many times a day should I consume it?",
        a: "We suggest consuming it 1-2 times daily, either between meals or immediately post-workout to fuel glycogen replenishment."
      }
    ];
  }
  return [
    {
      q: "Are GYMMM TANK supplements authentic?",
      a: "Yes, all our supplements are manufactured in state-of-the-art GMP certified facilities, utilizing premium imported raw materials to ensure maximum purity and effectiveness."
    },
    {
      q: "Do you offer cash on delivery (COD)?",
      a: "Yes, we support Cash on Delivery across India, alongside all major UPI, Net Banking, and Credit/Debit Card options."
    }
  ];
};

const getDosageSteps = (productName: string) => {
  const name = productName.toUpperCase();
  if (name.includes('WHEY') || name.includes('PROTEIN')) {
    return [
      { step: '1', title: 'MEASURE', desc: 'Add 1 heaping scoop (40g) of ISO Whey Tank.' },
      { step: '2', title: 'MIX & SHAKE', desc: 'Pour into 200-250ml of ice-cold water or milk.' },
      { step: '3', title: 'CONSUME', desc: 'Shake for 15s. Drink post-workout or in the morning.' }
    ];
  }
  if (name.includes('PRE-WORKOUT') || name.includes('DOUBLE SHOT')) {
    return [
      { step: '1', title: 'MEASURE', desc: 'Add 1 level scoop (12g) of Pre-Workout.' },
      { step: '2', title: 'MIX & SHAKE', desc: 'Pour into 250-300ml of ice-cold water.' },
      { step: '3', title: 'CONSUME', desc: 'Sip 20-30 minutes before training. Assess tolerance.' }
    ];
  }
  if (name.includes('CREATINE')) {
    return [
      { step: '1', title: 'MEASURE', desc: 'Add 1 level scoop (3g) of Creatine Charge.' },
      { step: '2', title: 'MIX & SHAKE', desc: 'Stir into water, juice, or your protein shake.' },
      { step: '3', title: 'CONSUME', desc: 'Drink daily. Consume 3-4L of water throughout the day.' }
    ];
  }
  if (name.includes('EAA') || name.includes('BCAA')) {
    return [
      { step: '1', title: 'MEASURE', desc: 'Add 1 level scoop (10g) of EAA + BCAA.' },
      { step: '2', title: 'MIX & SHAKE', desc: 'Dissolve in 300-400ml of cold water.' },
      { step: '3', title: 'CONSUME', desc: 'Sip continuously during training or post-workout.' }
    ];
  }
  if (name.includes('BURNER') || name.includes('FAT')) {
    return [
      { step: '1', title: 'MEASURE', desc: 'Take 1 capsule of Shred Tank Burner.' },
      { step: '2', title: 'WATER', desc: 'Drink with a large glass of water.' },
      { step: '3', title: 'CONSUME', desc: 'Take on empty stomach in morning or before cardio.' }
    ];
  }
  if (name.includes('CITRULLINE')) {
    return [
      { step: '1', title: 'MEASURE', desc: 'Add 1 scoop (2g) of Citrulline Malate.' },
      { step: '2', title: 'STACK', desc: 'Mix with water or add to your pre-workout shake.' },
      { step: '3', title: 'CONSUME', desc: 'Drink 30 minutes before workout for extreme pumps.' }
    ];
  }
  if (name.includes('GAINER') || name.includes('MASS')) {
    return [
      { step: '1', title: 'MEASURE', desc: 'Add 2 scoops (100g) of Massive Mass Gainer.' },
      { step: '2', title: 'MIX & SHAKE', desc: 'Pour into 350-400ml of whole milk or water.' },
      { step: '3', title: 'CONSUME', desc: 'Shake well. Drink between meals or post-workout.' }
    ];
  }
  return [
    { step: '1', title: 'MEASURE', desc: 'Take the recommended serving size.' },
    { step: '2', title: 'MIX', desc: 'Blend with water or your favorite beverage.' },
    { step: '3', title: 'CONSUME', desc: 'Drink at the recommended time of day.' }
  ];
};

const getComboDosageSteps = (comboId: string) => {
  if (comboId === 'pump-combo') {
    return [
      { step: '1', title: 'PRE-WORKOUT MIX', desc: 'Add 1 scoop of Double Shot Pre-Workout + 1 scoop (2g) of Citrulline Malate.' },
      { step: '2', title: 'WATER', desc: 'Mix together in 300ml of ice-cold water.' },
      { step: '3', title: 'TIME IT', desc: 'Consume 30 minutes before starting your training session.' }
    ];
  }
  if (comboId === 'gaining-combo') {
    return [
      { step: '1', title: 'PRE-WORKOUT', desc: 'Take 1 scoop of Double Shot Pre-workout 30 mins before training.' },
      { step: '2', title: 'POST-WORKOUT', desc: 'Mix 2 scoops of Massive Mass Gainer in 400ml milk.' },
      { step: '3', title: 'SIZE GAIN', desc: 'Drink Mass Gainer immediately post-workout or split between meals.' }
    ];
  }
  if (comboId === 'massive-gainer-combo') {
    return [
      { step: '1', title: 'FUEL LIFT', desc: 'Pre-workout: 1 scoop of Double Shot 30 mins before workout.' },
      { step: '2', title: 'HYDRATE', desc: 'Intra-workout: Sip EAA + BCAA Recovery Fuel during your lift.' },
      { step: '3', title: 'GROWTH', desc: 'Post-workout: Mix 2 scoops of Mass Gainer in milk.' }
    ];
  }
  if (comboId === 'lean-gain-combo') {
    return [
      { step: '1', title: 'POWER UP', desc: 'Take 1 scoop of Double Shot Pre-Workout 30 mins before training.' },
      { step: '2', title: 'REPAIR', desc: 'Mix 1 scoop of ISO Whey Tank in 200ml cold water.' },
      { step: '3', title: 'TIMING', desc: 'Drink ISO Whey post-workout to feed your muscles.' }
    ];
  }
  return [
    { step: '1', title: 'PRE-WORKOUT', desc: 'Consume pre-workout energy formulations before training.' },
    { step: '2', title: 'INTRA-WORKOUT', desc: 'Sip recovery and hydration products during your training.' },
    { step: '3', title: 'POST-WORKOUT', desc: 'Consume muscle repair proteins within 30 minutes after training.' }
  ];
};

const getComboSpecs = (comboId: string) => {
  if (comboId === 'pump-combo') {
    return [
      { key: 'Included Products', value: 'Double Shot Pre-Workout (30 Servings) + Citrulline Malate (100 Servings)' },
      { key: 'Dietary Type', value: '100% Vegetarian' },
      { key: 'Main Benefits', value: 'Skin-splitting pumps, delay fatigue, extreme focus' },
      { key: 'Recommended Goal', value: 'Muscle Building & Pump Expansion' },
      { key: 'Bundle discount', value: '15% Off Included' }
    ];
  }
  if (comboId === 'gaining-combo') {
    return [
      { key: 'Included Products', value: 'Massive Mass Gainer (3kg) + Double Shot Pre-Workout (30 Servings)' },
      { key: 'Dietary Type', value: '100% Vegetarian' },
      { key: 'Main Benefits', value: 'Explosive workout energy + high calorie mass shuttle' },
      { key: 'Recommended Goal', value: 'Mass & Strength Gaining' },
      { key: 'Bundle discount', value: '15% Off Included' }
    ];
  }
  if (comboId === 'massive-gainer-combo') {
    return [
      { key: 'Included Products', value: 'Double Shot Pre-Workout + EAA & BCAA Recovery Fuel + Massive Mass Gainer' },
      { key: 'Dietary Type', value: '100% Vegetarian' },
      { key: 'Main Benefits', value: 'Complete workout cycle: energy, hydration, size gains' },
      { key: 'Recommended Goal', value: 'Extreme Bulking Stack' },
      { key: 'Bundle discount', value: '20% Off Included (Best Value)' }
    ];
  }
  if (comboId === 'lean-gain-combo') {
    return [
      { key: 'Included Products', value: '100% ISO Whey Tank (1kg/2kg) + Double Shot Pre-Workout (30 Servings)' },
      { key: 'Dietary Type', value: '100% Vegetarian' },
      { key: 'Main Benefits', value: 'Pure Whey Isolate recovery + pre-workout strength drive' },
      { key: 'Recommended Goal', value: 'Lean Muscle Definition' },
      { key: 'Bundle discount', value: '15% Off Included' }
    ];
  }
  return [
    { key: 'Dietary Type', value: '100% Vegetarian' },
    { key: 'Quality Standard', value: 'GMP Premium Quality Certified' }
  ];
};

const getComboFaqs = (comboId: string) => {
  if (comboId === 'pump-combo') {
    return [
      {
        q: "How does the Pump Combo work?",
        a: "By combining Double Shot Pre-Workout (rich in L-Citrulline, Beta-Alanine, and Caffeine) with Pure Citrulline Malate, you amplify nitric oxide production, creating a massive vascular pump and extending muscle endurance."
      },
      {
        q: "How should I dose the Pump Combo?",
        a: "Mix 1 scoop of Double Shot Pre-Workout and 1 scoop (2g) of Citrulline Malate in 300ml of cold water, and drink 30 minutes before your workout."
      },
      {
        q: "Is it safe to stack these together?",
        a: "Yes. Citrulline Malate is non-stimulant, so stacking it with pre-workout increases blood flow without adding stimulants or jitters."
      }
    ];
  }
  if (comboId === 'gaining-combo') {
    return [
      {
        q: "Is this combo suitable for lean muscle gain or bulking?",
        a: "This combo is designed for heavy bulking. Massive Mass Gainer provides massive calories and carbs for size, while Double Shot Pre-Workout gives you the explosive strength to lift heavier."
      },
      {
        q: "When should I take each product?",
        a: "Take Double Shot Pre-Workout 30 minutes before training. Drink the Massive Mass Gainer post-workout or split it into half-servings taken between meals."
      }
    ];
  }
  if (comboId === 'massive-gainer-combo') {
    return [
      {
        q: "Who is the Beast Stack meant for?",
        a: "It's built for hardgainers looking to maximize size, strength, and recovery speed. It covers your pre-workout energy, intra-workout hydration (EAA+BCAA), and post-workout calories (Mass Gainer)."
      },
      {
        q: "How do I schedule these three supplements daily?",
        a: "Pre-Workout: 30 minutes before training. EAA+BCAA: Sip during your workout. Mass Gainer: Consume post-workout or between meals."
      }
    ];
  }
  if (comboId === 'lean-gain-combo') {
    return [
      {
        q: "Can I build lean muscle and drop fat with this stack?",
        a: "Yes, this is the ultimate lean muscle building stack. 100% ISO Whey Tank provides ultra-pure protein isolate with almost zero fat or sugar, and Pre-Workout powers heavy lifting to stimulate muscle density."
      },
      {
        q: "How do I take this stack?",
        a: "Pre-Workout: 30 minutes before training. ISO Whey Protein: 1 scoop post-workout and/or in the morning."
      }
    ];
  }
  return [
    {
      q: "Can I stack all products in the combo daily?",
      a: "Yes! The combos are synergistically formulated to be stacked together safely. Just follow the daily dosage instructions on each product."
    },
    {
      q: "Do I get extra savings on combos?",
      a: "Yes, all combos are pre-discounted up to 20% compared to buying products separately, and qualify for free express shipping."
    }
  ];
};

const getProductHighlights = (productName: string): { icon: string; value: string; label: string }[] => {
  const name = productName.toUpperCase();
  if (name.includes('WHEY') || name.includes('PROTEIN')) {
    return [
      { icon: '🧪', value: '27g', label: 'Protein Per Serving' },
      { icon: '🔥', value: '0g', label: 'Added Sugar' },
      { icon: '⚡', value: '5.26g', label: 'BCAAs Per Serving' },
      { icon: '🌱', value: '100%', label: 'Vegetarian' },
      { icon: '🔬', value: 'DigeZyme®', label: 'Enzyme Complex' },
      { icon: '🏆', value: 'USA Import', label: 'Raw Material Source' },
    ];
  }
  if (name.includes('PRE-WORKOUT') || name.includes('DOUBLE SHOT')) {
    return [
      { icon: '⚡', value: '300mg', label: 'Caffeine Anhydrous' },
      { icon: '💉', value: '6000mg', label: 'L-Citrulline Malate' },
      { icon: '🧠', value: '1000mg', label: 'L-Tyrosine Focus' },
      { icon: '🛡️', value: '3200mg', label: 'Beta-Alanine' },
      { icon: '🚫', value: 'ZERO', label: 'Banned Substances' },
      { icon: '⏱️', value: '30 Servings', label: 'Per Tub' },
    ];
  }
  if (name.includes('CREATINE')) {
    return [
      { icon: '💧', value: '99.9%', label: 'Purity Grade' },
      { icon: '⚡', value: '3g', label: 'Per Serving' },
      { icon: '🔬', value: '200 Mesh', label: 'Micronized Powder' },
      { icon: '🚫', value: 'ZERO', label: 'Additives / Fillers' },
      { icon: '🌱', value: '100%', label: 'Vegetarian' },
      { icon: '💪', value: '83', label: 'Servings (250g)' },
    ];
  }
  if (name.includes('EAA') || name.includes('BCAA')) {
    return [
      { icon: '🧬', value: '7g', label: 'EAAs Per Serving' },
      { icon: '⚡', value: '5g', label: 'BCAAs Per Serving' },
      { icon: '💧', value: '0g', label: 'Sugar Free' },
      { icon: '🥥', value: 'Coconut Water', label: 'Electrolyte Source' },
      { icon: '🌱', value: '100%', label: 'Vegetarian' },
      { icon: '🏋️', value: 'Intra-Workout', label: 'Optimal Timing' },
    ];
  }
  if (name.includes('BURNER') || name.includes('FAT')) {
    return [
      { icon: '🔥', value: 'Thermogenic', label: 'Fat Burn Matrix' },
      { icon: '🏃', value: 'L-Carnitine', label: 'Fat Transport' },
      { icon: '🍃', value: 'Green Tea', label: 'Antioxidant Boost' },
      { icon: '🧠', value: '200mg', label: 'Caffeine Focus' },
      { icon: '🌱', value: '100%', label: 'Veg Capsules' },
      { icon: '⏰', value: '60', label: 'Capsules Per Pack' },
    ];
  }
  if (name.includes('CITRULLINE')) {
    return [
      { icon: '💉', value: '2000mg', label: 'L-Citrulline Malate' },
      { icon: '⚡', value: '2:1 Ratio', label: 'Optimal Active Blend' },
      { icon: '🩸', value: 'Nitric Oxide', label: 'Pump Amplifier' },
      { icon: '🌱', value: 'ZERO', label: 'Fillers / Flavors' },
      { icon: '🔬', value: '100', label: 'Servings Per Bag' },
      { icon: '🏋️', value: 'Stackable', label: 'Versatile Formula' },
    ];
  }
  // Massive Mass Gainer default
  return [
    { icon: '🍽️', value: '700 kcal', label: 'Per Serving' },
    { icon: '💪', value: '30g', label: 'Protein Per Serving' },
    { icon: '🍞', value: '140g', label: 'Complex Carbs' },
    { icon: '🔬', value: 'Protease+', label: 'Digestive Enzymes' },
    { icon: '🌱', value: '100%', label: 'Vegetarian' },
    { icon: '🏋️', value: 'Hardgainer', label: 'Ideal For' },
  ];
};

const getWhyChoosePoints = (productName: string): { feature: string; us: boolean; them: boolean }[] => {
  const name = productName.toUpperCase();
  const base = [
    { feature: 'GMP Certified Facility', us: true, them: false },
    { feature: '100% Steroid-Free Guarantee', us: true, them: false },
    { feature: 'Transparent Label (No Prop Blends)', us: true, them: false },
    { feature: 'Premium USA / EU Imported Raw Material', us: true, them: false },
    { feature: 'DigeZyme® or Clinical Enzyme Blend', us: true, them: false },
  ];
  if (name.includes('WHEY') || name.includes('PROTEIN')) {
    return [
      { feature: '27g Pure Isolate Protein / Serving', us: true, them: false },
      { feature: 'Zero Amino Spiking (No Creatine/Taurine inflation)', us: true, them: false },
      ...base,
    ];
  }
  if (name.includes('PRE-WORKOUT') || name.includes('DOUBLE SHOT')) {
    return [
      { feature: '300mg Real Caffeine Anhydrous (Verified)', us: true, them: false },
      { feature: 'Clinical L-Citrulline Dose (6g)', us: true, them: false },
      ...base,
    ];
  }
  return [
    { feature: 'Full Disclosure of Every Ingredient', us: true, them: false },
    { feature: 'No Added Fillers or Artificial Coloring', us: true, them: false },
    ...base,
  ];
};

const getCertifications = () => [
  { icon: '🏭', label: 'GMP Certified' },
  { icon: '🔬', label: 'Lab Tested' },
  { icon: '🌱', label: '100% Vegetarian' },
  { icon: '🚫', label: 'No Steroids' },
  { icon: '🇮🇳', label: 'Made in India' },
  { icon: '✅', label: 'Batch Verified' },
];

interface FlavorOption {
  name: string;
  image: string;
  badge: string;
  badgeColor: string;
}

interface SizeOption {
  name: string;
  supply: string;
  price: number;
  compareAtPrice: number;
  savePercent: number;
  servingsText: string;
}

const getProductVariantsData = (productName: string): { flavors: FlavorOption[]; sizes: SizeOption[] } => {
  const name = productName.toUpperCase();
  if (name.includes('WHEY') || name.includes('PROTEIN')) {
    return {
      flavors: [
        { name: 'Creamy Chocolate', image: '/images/flavors/chocolate.png', badge: 'CLASSIC', badgeColor: '#000000' },
        { name: 'Colombian Coffee', image: '/images/flavors/coffee.png', badge: 'MOST LOVED', badgeColor: '#A72D2D' },
        { name: 'Cookies and Cream', image: '/images/flavors/cookies.png', badge: 'CREAMY NOTE', badgeColor: '#533C2A' },
        { name: 'Coconut Ice Cream', image: '/images/flavors/unflavored.png', badge: 'LESS SWEETENED', badgeColor: '#3A3A3A' },
        { name: 'Pistachio Ice Cream', image: '/images/flavors/pistachio.png', badge: 'SWEET TOOTH', badgeColor: '#008080' }
      ],
      sizes: [
        { name: '1.81 Kg (4lbs)', supply: '2-month supply', price: 8499, compareAtPrice: 12499, savePercent: 32, servingsText: '(55 servings; ₹155/serving)' },
        { name: '907g (2lbs)', supply: '1-month supply', price: 4759, compareAtPrice: 6999, savePercent: 32, servingsText: '(30 servings; ₹159/serving)' },
        { name: '4 KG (8.8lbs)', supply: '4-month supply', price: 18360, compareAtPrice: 26999, savePercent: 31, servingsText: '(121 servings; ₹152/serving)' }
      ]
    };
  }
  if (name.includes('PRE-WORKOUT') || name.includes('DOUBLE SHOT')) {
    return {
      flavors: [
        { name: 'Sour Watermelon', image: '/images/flavors/watermelon.png', badge: 'TANGY EXPLOSION', badgeColor: '#A72D2D' },
        { name: 'Fruit Punch', image: '/images/flavors/fruit.png', badge: 'FRUITY RUSH', badgeColor: '#D16013' },
        { name: 'Blue Raspberry', image: '/images/flavors/berry.png', badge: 'SWEET & SOUR', badgeColor: '#0C62B5' }
      ],
      sizes: [
        { name: '30 Servings (360g)', supply: '30-day supply', price: 2499, compareAtPrice: 2999, savePercent: 17, servingsText: '(30 servings; ₹83/serving)' },
        { name: '15 Servings (180g)', supply: '15-day supply', price: 1499, compareAtPrice: 1999, savePercent: 25, servingsText: '(15 servings; ₹100/serving)' }
      ]
    };
  }
  if (name.includes('CREATINE')) {
    return {
      flavors: [
        { name: 'Unflavored', image: '/images/flavors/unflavored.png', badge: '100% PURE', badgeColor: '#000000' },
        { name: 'Green Apple', image: '/images/flavors/apple.png', badge: 'REFRESHING', badgeColor: '#0B822F' }
      ],
      sizes: [
        { name: '250g (83 Servings)', supply: '3-month supply', price: 999, compareAtPrice: 1299, savePercent: 23, servingsText: '(83 servings; ₹12/serving)' },
        { name: '500g (166 Servings)', supply: '6-month supply', price: 1799, compareAtPrice: 2499, savePercent: 28, servingsText: '(166 servings; ₹11/serving)' }
      ]
    };
  }
  if (name.includes('EAA') || name.includes('BCAA')) {
    return {
      flavors: [
        { name: 'Mango Shake', image: '/images/flavors/fruit.png', badge: 'TROPICAL', badgeColor: '#D16013' },
        { name: 'Pineapple Rush', image: '/images/flavors/fruit.png', badge: 'ZESTY', badgeColor: '#A89E14' }
      ],
      sizes: [
        { name: '300g (30 Servings)', supply: '30-day supply', price: 1599, compareAtPrice: 1999, savePercent: 20, servingsText: '(30 servings; ₹53/serving)' }
      ]
    };
  }
  if (name.includes('BURNER') || name.includes('FAT')) {
    return {
      flavors: [
        { name: 'Lemon Lime', image: '/images/flavors/apple.png', badge: 'SHRED MATRIX', badgeColor: '#0B822F' },
        { name: 'Grape', image: '/images/flavors/berry.png', badge: 'THERMO BLAST', badgeColor: '#7A1FA1' }
      ],
      sizes: [
        { name: '60 Capsules', supply: '1-month supply', price: 1999, compareAtPrice: 2499, savePercent: 20, servingsText: '(60 capsules; ₹33/capsule)' }
      ]
    };
  }
  if (name.includes('CITRULLINE')) {
    return {
      flavors: [
        { name: 'Unflavored', image: '/images/flavors/unflavored.png', badge: 'RAW PURE', badgeColor: '#000000' },
        { name: 'Orange Blast', image: '/images/flavors/fruit.png', badge: 'PUMP MATRIX', badgeColor: '#D16013' }
      ],
      sizes: [
        { name: '200g (100 Servings)', supply: '100-day supply', price: 1499, compareAtPrice: 1999, savePercent: 25, servingsText: '(100 servings; ₹15/serving)' }
      ]
    };
  }
  // Default is Massive Mass Gainer
  return {
    flavors: [
      { name: 'Double Chocolate', image: '/images/flavors/chocolate.png', badge: 'RICH CLASSIC', badgeColor: '#000000' },
      { name: 'Cookies & Cream', image: '/images/flavors/cookies.png', badge: 'CREAMY SHAKE', badgeColor: '#3A3A3A' }
    ],
    sizes: [
      { name: '3 kg (30 Servings)', supply: '1-month supply', price: 2999, compareAtPrice: 3499, savePercent: 14, servingsText: '(30 servings; ₹100/serving)' },
      { name: '1 kg (10 Servings)', supply: '10-day supply', price: 1199, compareAtPrice: 1499, savePercent: 20, servingsText: '(10 servings; ₹120/serving)' }
    ]
  };
};

const getComboVariantsData = (comboId: string): { sizes: SizeOption[] } => {
  if (comboId === 'pump-combo') {
    return {
      sizes: [
        { name: 'Standard Stack', supply: 'Double Shot (30s) + Citrulline (100s)', price: 3399, compareAtPrice: 4498, savePercent: 24, servingsText: 'Stack bundle discount applied' }
      ]
    };
  }
  if (comboId === 'gaining-combo') {
    return {
      sizes: [
        { name: 'Standard Stack', supply: 'Mass Gainer (3kg) + Double Shot (30s)', price: 4699, compareAtPrice: 5998, savePercent: 21, servingsText: 'Stack bundle discount applied' }
      ]
    };
  }
  if (comboId === 'massive-gainer-combo') {
    return {
      sizes: [
        { name: 'Standard Stack', supply: 'Double Shot + EAA + Mass Gainer', price: 5699, compareAtPrice: 7997, savePercent: 28, servingsText: 'Best Value Stack savings' }
      ]
    };
  }
  // lean-gain-combo
  return {
    sizes: [
      { name: 'Standard Stack', supply: '1.81kg Whey + 30s Pre-workout', price: 8999, compareAtPrice: 11498, savePercent: 21, servingsText: 'Flagship Lean Builder Stack' },
      { name: 'Beast Stack', supply: '4kg Whey + 30s Pre-workout', price: 16999, compareAtPrice: 21359, savePercent: 20, servingsText: 'Heavy Duty Stack' }
    ]
  };
};

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  productId,
  comboId,
  onBack,
  onNavigateToProduct
}) => {
  const { products, fetchProducts } = useStore();
  const { addToCart } = useCart();

  // State for background bicep particles
  interface BicepParticle {
    id: number;
    left: number;
    scale: number;
    duration: number;
    delay: number;
    rotate: number;
  }
  const [particles, setParticles] = useState<BicepParticle[]>([]);

  useEffect(() => {
    const spawnBatch = () => {
      // Spawn 10 to 15 particles
      const count = Math.floor(Math.random() * 6) + 10;
      const newParticles = Array.from({ length: count }).map((_, i) => ({
        id: Date.now() + Math.random() + i,
        left: Math.random() < 0.5 ? Math.random() * 12 : 88 + Math.random() * 12, // Spawn only on left (0-12%) or right (88-100%) margins
        scale: Math.random() * 0.7 + 0.6, // scale between 0.6 and 1.3
        duration: Math.random() * 3.5 + 4.5, // 4.5s to 8s duration to drift up
        delay: Math.random() * 2, // stagger the animation start
        rotate: Math.random() * 80 - 40 // starting rotation angle
      }));
      
      setParticles((prev) => {
        const combined = [...prev, ...newParticles];
        // Keep only the most recent particles to prevent DOM congestion (max 45 particles)
        if (combined.length > 45) {
          return combined.slice(combined.length - 45);
        }
        return combined;
      });
    };

    spawnBatch(); // Spawn initial set immediately
    const interval = setInterval(spawnBatch, 3500); // spawn new batch every 3.5 seconds

    return () => clearInterval(interval);
  }, [productId, comboId]);

  const [activeImageTab, setActiveImageTab] = useState<'mockup' | 'nutrition'>('mockup');
  const [quantity, setQuantity] = useState(1);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const [activeIngredientIdx, setActiveIngredientIdx] = useState(0);

  const formatPrice = (num: number) => {
    return '₹' + Math.round(num).toLocaleString('en-IN');
  };

  useEffect(() => {
    setActiveIngredientIdx(0);
  }, [productId]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowFloatingBar(true);
      } else {
        setShowFloatingBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [selectedFlavor, setSelectedFlavor] = useState('Default');
  const [selectedSizeObj, setSelectedSizeObj] = useState<SizeOption | null>(null);
  const [selectedComboSizeObj, setSelectedComboSizeObj] = useState<SizeOption | null>(null);

  const [productAccordions, setProductAccordions] = useState({
    description: true,
    benefits: false,
    ingredients: false,
    usage: false,
    precautions: false
  });
  
  const [comboAccordions, setComboAccordions] = useState({
    description: true,
    products: false,
    ingredients: false,
    usage: false,
    precautions: false
  });

  const toggleProductAccordion = (section: keyof typeof productAccordions) => {
    setProductAccordions(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleComboAccordion = (section: keyof typeof comboAccordions) => {
    setComboAccordions(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Combo detail states
  const [selectedComboProductImg, setSelectedComboProductImg] = useState<string | null>(null);

  // Reload products if empty
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products]);

  // Handle scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImageTab('mockup');
    setQuantity(1);
    setSelectedComboProductImg(null);
    setProductAccordions({
      description: true,
      benefits: false,
      ingredients: false,
      usage: false,
      precautions: false
    });
    setComboAccordions({
      description: true,
      products: false,
      ingredients: false,
      usage: false,
      precautions: false
    });

    if (productId) {
      const pObj = products.find(p => p.id === productId);
      if (pObj) {
        const variants = getProductVariantsData(pObj.name);
        setSelectedFlavor(variants.flavors[0]?.name || 'Default');
        setSelectedSizeObj(variants.sizes[0] || null);
      }
    }
    if (comboId) {
      const cVariants = getComboVariantsData(comboId);
      setSelectedComboSizeObj(cVariants.sizes[0] || null);
    }
  }, [productId, comboId, products]);

  // ==========================================
  // COMBO PAGE RESOLUTION
  // ==========================================
  if (comboId) {
    const COMBOS_DATA = [
      {
        id: 'pump-combo',
        name: 'PUMP COMBO',
        badge: '💥 PUMP & VASCULARITY',
        description: 'Stack Pure Citrulline Malate with Double Shot Pre-Workout for maximum blood flow, skin-splitting pumps, and laser focus.',
        productNames: ['PURE CITRULLINE MALATE', 'DOUBLE SHOT PRE-WORKOUT'],
        discountPercent: 15,
        benefits: [
          "Synergistic Nitric Oxide sweep to maximize vascular muscle pumps.",
          "Delays muscle exhaustion so you can train heavier, longer.",
          "Tunnel-vision concentration to lock focus on target lifts."
        ]
      },
      {
        id: 'gaining-combo',
        name: 'GAINING COMBO',
        badge: '💪 BULK & POWER',
        description: 'Pair Massive Mass Gainer with Double Shot Pre-Workout to fuel explosive heavy sessions and pack on serious size.',
        productNames: ['MASSIVE MASS GAINER', 'DOUBLE SHOT PRE-WORKOUT'],
        discountPercent: 15,
        benefits: [
          "Caloric overload stacked with explosive pre-workout energy.",
          "High-glycemic carbs shuttle protein directly to broken muscle fibers.",
          "Forces weight gain and pushes strength maximums."
        ]
      },
      {
        id: 'massive-gainer-combo',
        name: 'MASSIVE GAINER COMBO',
        badge: '👑 THE BEAST STACK',
        description: 'Double Shot Pre-Workout + EAA & BCAA Recovery Fuel + Massive Mass Gainer. The ultimate recovery and mass building pack.',
        productNames: ['DOUBLE SHOT PRE-WORKOUT', 'EAA + BCAA RECOVERY FUEL', 'MASSIVE MASS GAINER'],
        discountPercent: 20,
        benefits: [
          "All-in-one stack covering energy, hydration, amino recovery, and mass gains.",
          "Coconut water electrolytes keep muscles hydrated to prevent cramps.",
          "Dosed to support extreme size gains during heavy lifting cycles."
        ]
      },
      {
        id: 'lean-gain-combo',
        name: 'LEAN GAIN COMBO',
        badge: '⚡ SHREDDED STRENGTH',
        description: 'Combine ultra-pure 100% ISO Whey Tank with Double Shot Pre-Workout for clean muscle gains and rapid recovery.',
        productNames: ['100% ISO WHEY TANK', 'DOUBLE SHOT PRE-WORKOUT'],
        discountPercent: 15,
        benefits: [
          "Explosive pre-workout power combined with ultra-pure whey protein isolate.",
          "Guarantees zero recovery bottlenecks - repairs muscle fibers instantly.",
          "Builds dry, lean muscle tissue without water retention."
        ]
      }
    ];

    const combo = COMBOS_DATA.find((c) => c.id === comboId);
    if (!combo) {
      return (
        <div className="no-products">
          <h3>Combo Not Found</h3>
          <button className="admin-btn admin-btn-primary" onClick={onBack}>BACK TO STORE</button>
        </div>
      );
    }

    // Resolve included products
    const resolvedProducts = combo.productNames
      .map((pName) => products.find((p) => p.name.toUpperCase() === pName.toUpperCase()))
      .filter((p): p is Product => !!p);

    const comboVariants = getComboVariantsData(combo.id);

    const regularTotal = resolvedProducts.reduce((sum, p) => sum + p.price, 0);
    const activeTotal = resolvedProducts.reduce((sum, p) => sum + (p.salePrice ?? p.price), 0);
    const comboPrice = Math.round(activeTotal * (1 - combo.discountPercent / 100));
    
    const currentPrice = selectedComboSizeObj ? selectedComboSizeObj.price : comboPrice;
    const currentComparePrice = selectedComboSizeObj ? selectedComboSizeObj.compareAtPrice : regularTotal;
    const currentSavings = currentComparePrice - currentPrice;
    const currentSavePercent = selectedComboSizeObj ? selectedComboSizeObj.savePercent : combo.discountPercent;

    const mainDisplayImg = selectedComboProductImg || resolvedProducts[0]?.image || '/images/logo.png';

    const handleAddComboToCart = () => {
      const ratio = currentPrice / activeTotal;
      resolvedProducts.forEach((product) => {
        const flavor = product.flavors.split(',')[0]?.trim() || 'Default';
        // If it's a lean gain combo and user selected Beast Stack, let's map size of whey protein to 2kg!
        let size = product.sizes.split(',')[0]?.trim() || 'Default';
        if (combo.id === 'lean-gain-combo' && selectedComboSizeObj?.name === 'Beast Stack') {
          if (product.name.toUpperCase().includes('WHEY') || product.name.toUpperCase().includes('PROTEIN')) {
            size = '2 kg';
          }
        }
        const overridePrice = Math.round((product.salePrice ?? product.price) * ratio);
        const overrideComparePrice = product.price;
        addToCart(product, flavor, size, quantity, overridePrice, overrideComparePrice);
      });
      alert(`🔥 ${combo.name} (${quantity}x) added to your cart with bundle savings!`);
    };

    return (
      <div className="product-detail-view-container">
        {/* Background Bicep Shower */}
        <div className="bicep-shower-container">
          <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
            <defs>
              <linearGradient id="bicep-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d4af37" />
                <stop offset="50%" stopColor="#f9eeb9" />
                <stop offset="100%" stopColor="#8c6a23" />
              </linearGradient>
            </defs>
          </svg>
          {particles.map((p) => (
            <div
              key={p.id}
              className="floating-bicep-wrapper"
              style={{
                left: `${p.left}%`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`
              }}
            >
              <svg
                className="floating-bicep-particle"
                style={{
                  transform: `scale(${p.scale}) rotate(${p.rotate}deg)`
                }}
                viewBox="0 0 24 24"
                stroke="url(#bicep-gold-grad)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                width="36"
                height="36"
              >
                <path d="M12.409 13.017A5 5 0 0 1 22 15c0 3.866-4 7-9 7-4.077 0-8.153-.82-10.371-2.462-.426-.316-.631-.832-.62-1.362C2.118 12.723 2.627 2 10 2a3 3 0 0 1 3 3 2 2 0 0 1-2 2c-1.105 0-1.64-.444-2-1" />
                <path d="M15 14a5 5 0 0 0-7.584 2" />
              </svg>
            </div>
          ))}
        </div>

        {/* Navigation Breadcrumb */}
        <div className="detail-breadcrumb">
          <button onClick={onBack} className="breadcrumb-back-link">
            <ArrowLeft size={16} /> BACK TO STORE
          </button>
          <span className="breadcrumb-divider">/</span>
          <span>COMBOS</span>
          <span className="breadcrumb-divider">/</span>
          <span className="breadcrumb-current">{combo.name}</span>
        </div>

        <div className="detail-main-layout">
          {/* Left Column: Stacking Showcase */}
          <div className="detail-image-showcase">
            <div className="main-display-img-wrap" style={{ backgroundColor: '#0c0c0c', border: '1px solid var(--border-glass)', borderRadius: '4px', overflow: 'hidden' }}>
              {selectedComboProductImg ? (
                <img src={mainDisplayImg} alt="Combo Product View" className="detail-main-img" style={{ objectFit: 'contain', padding: '1.5rem' }} />
              ) : (
                /* Combo Stacking visual */
                <div className="detail-combo-composite" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {resolvedProducts.map((p, idx) => {
                    let transformStyle = '';
                    if (resolvedProducts.length === 2) {
                      transformStyle = idx === 0 ? 'translateX(-30px) rotate(-6deg)' : 'translateX(30px) rotate(6deg)';
                    } else if (resolvedProducts.length === 3) {
                      transformStyle = idx === 0 ? 'translateX(-50px) scale(0.9)' : idx === 1 ? 'scale(1.05) z-index(3)' : 'translateX(50px) scale(0.9)';
                    }
                    return (
                      <img
                        key={p.id}
                        src={p.image}
                        alt={p.name}
                        style={{
                          width: '200px',
                          height: '200px',
                          objectFit: 'contain',
                          position: 'absolute',
                          transform: transformStyle,
                          transition: 'all 0.3s ease'
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Thumbnail Selectors */}
            <div className="detail-thumbnails-row">
              <div 
                className={`detail-thumbnail-card ${!selectedComboProductImg ? 'active' : ''}`}
                onClick={() => setSelectedComboProductImg(null)}
              >
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--gold-primary)' }}>STACK VIEW</div>
              </div>
              {resolvedProducts.map((p) => (
                <div 
                  key={p.id}
                  className={`detail-thumbnail-card ${selectedComboProductImg === p.image ? 'active' : ''}`}
                  onClick={() => setSelectedComboProductImg(p.image)}
                >
                  <img src={p.image} alt={p.name} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Configuration & Checkout */}
          <div className="detail-config-column">
            <span className="combo-card-badge-inline" style={{ alignSelf: 'flex-start', marginBottom: '0.5rem' }}>{combo.badge}</span>
            <h1 className="detail-title">{combo.name}</h1>
            
            <div className="detail-rating-row">
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--gold-primary)" color="var(--gold-primary)" />)}
              </div>
              <span className="rating-count">⭐ 4.9 (24 reviews)</span>
            </div>

            <p className="detail-short-desc">{combo.description}</p>

            {/* Included products listing */}
            <div className="combo-included-checklist" style={{ margin: '1.5rem 0', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>PRODUCTS INCLUDED IN BUNDLE:</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.6rem' }}>
                {resolvedProducts.map((p) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }} onClick={() => onNavigateToProduct(p.id)}>
                    <img src={p.image} alt={p.name} style={{ width: '42px', height: '42px', objectFit: 'contain', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '4px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>{p.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--gold-secondary)' }}>View details →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-price-panel">
              <div className="price-row">
                <span className="original-price">₹{Math.round(currentComparePrice).toLocaleString('en-IN')}</span>
                <span className="discount-tag">Save {currentSavePercent}%</span>
              </div>
              <div className="active-price">₹{Math.round(currentPrice).toLocaleString('en-IN')}</div>
              <div className="savings-alert">YOU SAVE ₹{Math.round(currentSavings).toLocaleString('en-IN')} IMMEDIATELY</div>
            </div>

            <div className="checkout-config-controls">
              {/* Stacked size rows */}
              {comboVariants.sizes.length > 0 && (
                <div className="config-control-group" style={{ marginBottom: '0.5rem' }}>
                  <span className="control-label">CHOOSE STACK:</span>
                  <div className="size-options-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.6rem' }}>
                    {comboVariants.sizes.map((sOpt) => {
                      const isSelected = selectedComboSizeObj?.name === sOpt.name;
                      return (
                        <div 
                          key={sOpt.name}
                          className={`size-option-row ${isSelected ? 'active' : ''}`}
                          onClick={() => setSelectedComboSizeObj(sOpt)}
                          style={{ position: 'relative', cursor: 'pointer' }}
                        >
                          <div className="size-save-badge">Save {sOpt.savePercent}%</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div className={`size-option-radio ${isSelected ? 'checked' : ''}`}>
                              {isSelected && <div className="radio-inner" />}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span className="size-option-title">{sOpt.name}</span>
                              <span className="size-option-supply">{sOpt.supply}</span>
                            </div>
                          </div>
                          <div className="size-option-right-price" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                              <span className="size-option-price">₹{sOpt.price.toLocaleString('en-IN')}</span>
                              <span className="size-option-compare">₹{sOpt.compareAtPrice.toLocaleString('en-IN')}</span>
                            </div>
                            <span className="size-option-servings">{sOpt.servingsText}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="quantity-actions-row">
                <div className="quantity-counter-group">
                  <span className="control-label">QTY:</span>
                  <div className="quantity-counter">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="qty-btn">-</button>
                    <span className="qty-value">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="qty-btn">+</button>
                  </div>
                </div>

                <button className="detail-add-cart-btn" onClick={handleAddComboToCart}>
                  <ShoppingBag size={18} />
                  Add To Bag | ₹{(currentPrice * quantity).toLocaleString('en-IN')}
                </button>
              </div>

              <div className="snapmint-emi-bar" style={{ marginTop: '0.2rem', textAlign: 'center', fontSize: '0.82rem', fontFamily: 'var(--font-athletic)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Or pay in 3 EMIs of <strong style={{ color: 'var(--gold-primary)' }}>₹{Math.round(currentPrice / 3)}</strong> with <span style={{ color: '#00cc66', fontWeight: 800 }}>snapmint</span>
              </div>
            </div>

            {/* Quick Trust Badges */}
            <div className="detail-trust-bullets">
              <div className="bullet"><ShieldCheck size={16} /> <span>100% Genuine Lab Certified Products</span></div>
              <div className="bullet"><Truck size={16} /> <span>Free Express Shipping (COD Available)</span></div>
            </div>

            {/* Collapsible Accordion Rows (Ripped Up Nutrition Style) */}
            <div className="product-accordions-container" style={{ marginTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              
              {/* 1. Description & Advantage Accordion */}
              <div className="product-info-accordion">
                <div 
                  className={`accordion-header ${comboAccordions.description ? 'open' : ''}`}
                  onClick={() => toggleComboAccordion('description')}
                >
                  <span className="accordion-title">Description & Advantage</span>
                  <span className="accordion-icon">{comboAccordions.description ? '−' : '+'}</span>
                </div>
                <div className={`accordion-content ${comboAccordions.description ? 'open' : ''}`}>
                  <p className="tab-paragraph-text" style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    {combo.description}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {combo.benefits.map((benefit, idx) => (
                      <div key={idx} className="benefit-bullet-detail" style={{ fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>• </span>
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Included Products Accordion */}
              <div className="product-info-accordion">
                <div 
                  className={`accordion-header ${comboAccordions.products ? 'open' : ''}`}
                  onClick={() => toggleComboAccordion('products')}
                >
                  <span className="accordion-title">Included Products</span>
                  <span className="accordion-icon">{comboAccordions.products ? '−' : '+'}</span>
                </div>
                <div className={`accordion-content ${comboAccordions.products ? 'open' : ''}`}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
                    {resolvedProducts.map((p) => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }} onClick={() => onNavigateToProduct(p.id)}>
                        <img src={p.image} alt={p.name} style={{ width: '42px', height: '42px', objectFit: 'contain', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '4px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>{p.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--gold-secondary)' }}>View details →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Specs Accordion */}
              <div className="product-info-accordion">
                <div 
                  className={`accordion-header ${comboAccordions.ingredients ? 'open' : ''}`}
                  onClick={() => toggleComboAccordion('ingredients')}
                >
                  <span className="accordion-title">Ingredients & Specs</span>
                  <span className="accordion-icon">{comboAccordions.ingredients ? '−' : '+'}</span>
                </div>
                <div className={`accordion-content ${comboAccordions.ingredients ? 'open' : ''}`}>
                  <div className="specs-table-container" style={{ marginTop: '0.5rem' }}>
                    <table className="specs-table">
                      <tbody>
                        {getComboSpecs(combo.id).map((spec, index) => (
                          <tr key={index}>
                            <td className="spec-key" style={{ padding: '0.8rem 1rem' }}>{spec.key}</td>
                            <td className="spec-value" style={{ padding: '0.8rem 1rem' }}>{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 4. Dosage Steps Accordion */}
              <div className="product-info-accordion">
                <div 
                  className={`accordion-header ${comboAccordions.usage ? 'open' : ''}`}
                  onClick={() => toggleComboAccordion('usage')}
                >
                  <span className="accordion-title">Dosage Steps</span>
                  <span className="accordion-icon">{comboAccordions.usage ? '−' : '+'}</span>
                </div>
                <div className={`accordion-content ${comboAccordions.usage ? 'open' : ''}`}>
                  <div className="usage-steps-container" style={{ gridTemplateColumns: '1fr', gap: '1rem', marginTop: '0.5rem' }}>
                    {getComboDosageSteps(combo.id).map((stepObj) => (
                      <div key={stepObj.step} className="usage-step-card" style={{ padding: '1rem' }}>
                        <div className="usage-step-badge" style={{ marginBottom: '0.5rem' }}>STEP {stepObj.step}</div>
                        <h4 className="usage-step-title" style={{ fontSize: '1rem' }}>{stepObj.title}</h4>
                        <p className="usage-step-desc" style={{ fontSize: '0.85rem' }}>{stepObj.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Precautions Accordion */}
              <div className="product-info-accordion">
                <div 
                  className={`accordion-header ${comboAccordions.precautions ? 'open' : ''}`}
                  onClick={() => toggleComboAccordion('precautions')}
                >
                  <span className="accordion-title">Precautions</span>
                  <span className="accordion-icon">{comboAccordions.precautions ? '−' : '+'}</span>
                </div>
                <div className={`accordion-content ${comboAccordions.precautions ? 'open' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', background: 'rgba(255, 51, 51, 0.05)', border: '1px solid rgba(255, 51, 51, 0.15)', borderRadius: '4px', marginTop: '0.5rem' }}>
                    <HelpCircle size={18} color="var(--accent-red)" style={{ flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--accent-red)', fontWeight: 600 }}>Always store the stacked products sealed in a cool, dry place. Keep out of reach of children. Do not exceed the recommended daily usage. Consult with an appropriately licensed healthcare professional before starting any stacked supplement regimen.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Combo Key Highlights Section */}
        <section className="detail-highlights-section">
          <h2 className="highlights-section-title">KEY HIGHLIGHTS</h2>
          <div className="highlights-grid">
            {getProductHighlights(combo.productNames[0] || combo.name).map((h, idx) => (
              <div key={idx} className="highlight-card">
                <span className="highlight-icon">{h.icon}</span>
                <span className="highlight-value">{h.value}</span>
                <span className="highlight-label">{h.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose GYMMM TANK Section */}
        <section className="why-choose-section">
          <h2 className="why-choose-title">WHY CHOOSE <span className="gold-text">GYMMM TANK?</span></h2>
          <div className="why-choose-table">
            <div className="why-choose-header-row">
              <div className="why-choose-feature-col">FEATURE</div>
              <div className="why-choose-us-col">GYMMM TANK</div>
              <div className="why-choose-them-col">OTHERS</div>
            </div>
            {getWhyChoosePoints(combo.name).map((row, idx) => (
              <div key={idx} className="why-choose-row">
                <div className="why-choose-feature-col">{row.feature}</div>
                <div className="why-choose-us-col"><span className="check-yes">✓</span></div>
                <div className="why-choose-them-col"><span className="check-no">✗</span></div>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications Strip */}
        <section className="certifications-strip">
          {getCertifications().map((cert, idx) => (
            <div key={idx} className="cert-badge">
              <span className="cert-icon">{cert.icon}</span>
              <span className="cert-label">{cert.label}</span>
            </div>
          ))}
        </section>

        {/* Combo Specific FAQs Section */}
        <section className="detail-faqs-section">
          <h2 className="faqs-title">FREQUENTLY ASKED QUESTIONS</h2>
          <div className="faqs-accordion-list">
            {getComboFaqs(combo.id).map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div 
                  key={idx} 
                  className={`faq-accordion-item ${isOpen ? 'open' : ''}`}
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                >
                  <div className="faq-question-bar">
                    <span className="faq-question-text">{faq.q}</span>
                    <span className="faq-toggle-icon">{isOpen ? '−' : '+'}</span>
                  </div>
                  <div className="faq-answer-content">
                    <p className="faq-answer-text">{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  // ==========================================
  // PRODUCT PAGE RESOLUTION
  // ==========================================
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="no-products">
        <h3>Supplement Vault Loading...</h3>
        <button className="admin-btn admin-btn-primary" onClick={onBack}>BACK TO STORE</button>
      </div>
    );
  }

  const variants = getProductVariantsData(product.name);

  const isOutOfStock = product.stock <= 0;
  
  // Resolve size object
  const currentSizeObj = selectedSizeObj || variants.sizes[0];
  const activePrice = currentSizeObj ? currentSizeObj.price : (product.salePrice ?? product.price);
  const compareAtPrice = currentSizeObj ? currentSizeObj.compareAtPrice : product.price;
  const savePercent = currentSizeObj ? currentSizeObj.savePercent : (product.salePrice !== null && product.salePrice < product.price ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0);
  const hasDiscountActive = currentSizeObj ? (compareAtPrice > activePrice) : (product.salePrice !== null && product.salePrice < product.price);

  const handleAddToCart = () => {
    const sizeName = currentSizeObj ? currentSizeObj.name : 'Default';
    addToCart(product, selectedFlavor, sizeName, quantity, activePrice, compareAtPrice);
    alert(`⚡ Added ${product.name} (${selectedFlavor} | ${sizeName} | ${quantity}x) to your cart!`);
  };

  const detailedInfo = getDetailedInfo(product.name);
  const richData = getProductRichSectionsData(product.name);
  const activeMainImage = activeImageTab === 'mockup' ? product.image : getNutritionImage(product.name);

  // Filter 3 related products
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.goal === product.goal))
    .slice(0, 3);

  return (
    <div className="product-detail-view-container">
      {/* Background Bicep Shower */}
      <div className="bicep-shower-container">
        <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
          <defs>
            <linearGradient id="bicep-gold-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4af37" />
              <stop offset="50%" stopColor="#f9eeb9" />
              <stop offset="100%" stopColor="#8c6a23" />
            </linearGradient>
          </defs>
        </svg>
        {particles.map((p) => (
          <div
            key={p.id}
            className="floating-bicep-wrapper"
            style={{
              left: `${p.left}%`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`
            }}
          >
            <svg
              className="floating-bicep-particle"
              style={{
                transform: `scale(${p.scale}) rotate(${p.rotate}deg)`
              }}
              viewBox="0 0 24 24"
              stroke="url(#bicep-gold-grad-2)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              width="36"
              height="36"
            >
              <path d="M12.409 13.017A5 5 0 0 1 22 15c0 3.866-4 7-9 7-4.077 0-8.153-.82-10.371-2.462-.426-.316-.631-.832-.62-1.362C2.118 12.723 2.627 2 10 2a3 3 0 0 1 3 3 2 2 0 0 1-2 2c-1.105 0-1.64-.444-2-1" />
              <path d="M15 14a5 5 0 0 0-7.584 2" />
            </svg>
          </div>
        ))}
      </div>

      {/* Navigation Breadcrumb */}
      <div className="detail-breadcrumb">
        <button onClick={onBack} className="breadcrumb-back-link">
          <ArrowLeft size={16} /> BACK TO STORE
        </button>
        <span className="breadcrumb-divider">/</span>
        <span style={{ cursor: 'pointer' }} onClick={onBack}>{product.category.toUpperCase()}</span>
        <span className="breadcrumb-divider">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      <div className="detail-main-layout">
        {/* Left Column: Visual Showcase */}
        <div className="detail-image-showcase">
          <div className="main-display-img-wrap" style={{ backgroundColor: '#0c0c0c', border: '1px solid var(--border-glass)', borderRadius: '4px', overflow: 'hidden' }}>
            <img 
              src={activeMainImage} 
              alt={product.name} 
              className="detail-main-img" 
              style={{ objectFit: activeImageTab === 'mockup' ? 'cover' : 'contain', padding: activeImageTab === 'mockup' ? '0' : '1.5rem' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = activeImageTab === 'mockup' ? '/images/pre_workout.png' : '/images/general_nutrition.png';
              }}
            />
          </div>

          {/* Thumbnail Selectors */}
          <div className="detail-thumbnails-row">
            <div 
              className={`detail-thumbnail-card ${activeImageTab === 'mockup' ? 'active' : ''}`}
              onClick={() => setActiveImageTab('mockup')}
            >
              <img src={product.image} alt="Mockup Tub" onError={(e) => { (e.target as HTMLImageElement).src = '/images/pre_workout.png' }} />
            </div>
            <div 
              className={`detail-thumbnail-card ${activeImageTab === 'nutrition' ? 'active' : ''}`}
              onClick={() => setActiveImageTab('nutrition')}
            >
              <img src={getNutritionImage(product.name)} alt="Nutrition Facts" onError={(e) => { (e.target as HTMLImageElement).src = '/images/general_nutrition.png' }} />
            </div>
          </div>
        </div>

        {/* Right Column: Configuration & Checkout */}
        <div className="detail-config-column">
          <span className="product-goal-tag" style={{ alignSelf: 'flex-start', marginBottom: '0.5rem' }}>{product.goal}</span>
          <h1 className="detail-title">{product.name}</h1>
          
          <div className="detail-rating-row">
            <div className="rating-stars">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--gold-primary)" color="var(--gold-primary)" />)}
            </div>
            <span className="rating-count">⭐ 4.9 (42 reviews)</span>
          </div>

          <p className="detail-short-desc">{product.description}</p>

          <div className="detail-price-panel">
            {product.category.toLowerCase() === 'coming soon' ? (
              <span className="price-coming-soon">COMING SOON</span>
            ) : hasDiscountActive ? (
              <>
                <div className="price-row">
                  <span className="original-price">₹{Math.round(compareAtPrice).toLocaleString('en-IN')}</span>
                  <span className="discount-tag">Save {savePercent}%</span>
                </div>
                <div className="active-price">₹{Math.round(activePrice).toLocaleString('en-IN')}</div>
              </>
            ) : (
              <div className="active-price">₹{Math.round(activePrice).toLocaleString('en-IN')}</div>
            )}
          </div>

          {/* Loyalty Coins Banner */}
          {product.category.toLowerCase() !== 'coming soon' && (
            <div className="loyalty-coins-badge" style={{ marginBottom: '1.5rem' }}>
              <span>🪙 Earn <strong>{Math.round(activePrice * 0.1)} GYMMM Coins</strong> on this order!</span>
            </div>
          )}

          {/* Macro Nutrient Summary Grid */}
          {getNutrientSummary(product.name) && (
            <div className="nutrient-summary-grid" style={{ marginBottom: '1.5rem' }}>
              {getNutrientSummary(product.name)!.map((nut) => (
                <div key={nut.label} className="nutrient-summary-card">
                  <span className="nutrient-val">{nut.value}</span>
                  <span className="nutrient-lbl">{nut.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="checkout-config-controls">
            {/* Choose Flavor Grid */}
            {variants.flavors.length > 0 && (
              <div className="config-control-group flavor-config-group">
                <div className="config-group-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span className="control-label" style={{ margin: 0 }}>CHOOSE FLAVOR</span>
                  <button 
                    className="nutrition-info-link"
                    onClick={() => setActiveImageTab('nutrition')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--gold-secondary)',
                      textDecoration: 'underline',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-body)',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Nutrition Information
                  </button>
                </div>
                <div className="selected-flavor-display" style={{ fontSize: '0.8rem', color: '#aaaaaa', marginBottom: '0.6rem' }}>
                  Flavor: <strong style={{ color: '#ffffff' }}>{selectedFlavor}</strong>
                </div>
                <div className="flavor-cards-row">
                  {variants.flavors.map((f) => {
                    const isActive = selectedFlavor === f.name;
                    return (
                      <div 
                        key={f.name}
                        className={`flavor-card ${isActive ? 'active' : ''}`}
                        onClick={() => setSelectedFlavor(f.name)}
                      >
                        {f.badge && (
                          <span className="flavor-card-badge" style={{ backgroundColor: f.badgeColor }}>
                            {f.badge}
                          </span>
                        )}
                        <div className="flavor-card-img-wrap">
                          <img src={f.image} alt={f.name} className="flavor-card-img" />
                        </div>
                        <span className="flavor-card-name">{f.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stacked Size Options List */}
            {variants.sizes.length > 0 && (
              <div className="config-control-group size-config-group" style={{ marginTop: '1.5rem' }}>
                <span className="control-label" style={{ display: 'block', marginBottom: '0.8rem' }}>SELECT SIZE</span>
                <div className="size-options-list">
                  {variants.sizes.map((s) => {
                    const isActive = currentSizeObj?.name === s.name;
                    return (
                      <div 
                        key={s.name}
                        className={`size-option-row ${isActive ? 'active' : ''}`}
                        onClick={() => setSelectedSizeObj(s)}
                      >
                        {s.savePercent > 0 && (
                          <span className="size-save-badge">Save {s.savePercent}%</span>
                        )}
                        <div className="size-option-left">
                          <div className={`size-option-radio ${isActive ? 'checked' : ''}`}>
                            {isActive && <div className="radio-inner" />}
                          </div>
                          <div className="size-option-info">
                            <span className="size-option-name">{s.name}</span>
                            <span className="size-option-supply">{s.supply}</span>
                          </div>
                        </div>
                        <div className="size-option-right">
                          <div className="size-option-price-block">
                            <span className="size-option-price">₹{Math.round(s.price).toLocaleString('en-IN')}</span>
                            <span className="size-option-compare">₹{Math.round(s.compareAtPrice).toLocaleString('en-IN')}</span>
                          </div>
                          <span className="size-option-servings">{s.servingsText}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Counter & Action buttons */}
            {product.category.toLowerCase() === 'coming soon' ? (
              <div className="coming-soon-btn-disabled" style={{ padding: '1rem', fontSize: '1.2rem', marginTop: '1.5rem' }}>COMING SOON</div>
            ) : isOutOfStock ? (
              <div className="out-of-stock-text" style={{ padding: '1rem', fontSize: '1.2rem', marginTop: '1.5rem' }}>OUT OF STOCK</div>
            ) : (
              <div className="quantity-actions-row" style={{ marginTop: '1.5rem' }}>
                <div className="quantity-counter-group">
                  <span className="control-label">QTY:</span>
                  <div className="quantity-counter">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="qty-btn">-</button>
                    <span className="qty-value">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="qty-btn">+</button>
                  </div>
                </div>

                <button className="detail-add-cart-btn" onClick={handleAddToCart}>
                  <ShoppingBag size={18} />
                  ADD TO BAG | ₹{Math.round(activePrice * quantity).toLocaleString('en-IN')}
                </button>
              </div>
            )}

            {/* Snapmint EMI tagline */}
            {!isOutOfStock && product.category.toLowerCase() !== 'coming soon' && (
              <div className="snapmint-emi-bar">
                Or pay in 3 EMIs of <strong style={{ color: 'var(--gold-primary)' }}>₹{Math.round((activePrice * quantity) / 3)}</strong> with <span style={{ color: '#00cc66', fontWeight: 800 }}>snapmint</span>
              </div>
            )}
          </div>

          {/* Quick Trust Bullets */}
          <div className="detail-trust-bullets">
            <div className="bullet"><ShieldCheck size={16} /> <span>100% Genuine Lab Certified Products</span></div>
            <div className="bullet"><Truck size={16} /> <span>Free Express Shipping on orders above ₹1,999</span></div>
          </div>

          {/* Collapsible Accordion Rows (Ripped Up Nutrition Style) */}
          <div className="product-accordions-container" style={{ marginTop: '2.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            
            {/* 1. Description Accordion */}
            <div className="product-info-accordion">
              <div 
                className={`accordion-header ${productAccordions.description ? 'open' : ''}`}
                onClick={() => toggleProductAccordion('description')}
              >
                <span className="accordion-title">Description</span>
                <span className="accordion-icon">{productAccordions.description ? '−' : '+'}</span>
              </div>
              <div className={`accordion-content ${productAccordions.description ? 'open' : ''}`}>
                <p className="tab-paragraph-text" style={{ margin: 0, whiteSpace: 'pre-line' }}>
                  {getProductLongDescription(product.name)}
                </p>
              </div>
            </div>

            {/* 2. Benefits Accordion */}
            <div className="product-info-accordion">
              <div 
                className={`accordion-header ${productAccordions.benefits ? 'open' : ''}`}
                onClick={() => toggleProductAccordion('benefits')}
              >
                <span className="accordion-title">Benefits</span>
                <span className="accordion-icon">{productAccordions.benefits ? '−' : '+'}</span>
              </div>
              <div className={`accordion-content ${productAccordions.benefits ? 'open' : ''}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {detailedInfo.benefits.map((benefit, idx) => (
                    <div key={idx} className="benefit-bullet-detail" style={{ fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>• </span>
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Ingredients & Specs Accordion */}
            <div className="product-info-accordion">
              <div 
                className={`accordion-header ${productAccordions.ingredients ? 'open' : ''}`}
                onClick={() => toggleProductAccordion('ingredients')}
              >
                <span className="accordion-title">Ingredients & Specs</span>
                <span className="accordion-icon">{productAccordions.ingredients ? '−' : '+'}</span>
              </div>
              <div className={`accordion-content ${productAccordions.ingredients ? 'open' : ''}`}>
                <div className="specs-table-container" style={{ marginTop: '0.5rem' }}>
                  <table className="specs-table">
                    <tbody>
                      {getIngredientsSpecs(product.name).map((spec, index) => (
                        <tr key={index}>
                          <td className="spec-key" style={{ padding: '0.8rem 1rem' }}>{spec.key}</td>
                          <td className="spec-value" style={{ padding: '0.8rem 1rem' }}>{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 4. Recommended Dosage Accordion */}
            <div className="product-info-accordion">
              <div 
                className={`accordion-header ${productAccordions.usage ? 'open' : ''}`}
                onClick={() => toggleProductAccordion('usage')}
              >
                <span className="accordion-title">Recommended Dosage</span>
                <span className="accordion-icon">{productAccordions.usage ? '−' : '+'}</span>
              </div>
              <div className={`accordion-content ${productAccordions.usage ? 'open' : ''}`}>
                <div className="usage-steps-container" style={{ gridTemplateColumns: '1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  {getDosageSteps(product.name).map((stepObj) => (
                    <div key={stepObj.step} className="usage-step-card" style={{ padding: '1rem' }}>
                      <div className="usage-step-badge" style={{ marginBottom: '0.5rem' }}>STEP {stepObj.step}</div>
                      <h4 className="usage-step-title" style={{ fontSize: '1rem' }}>{stepObj.title}</h4>
                      <p className="usage-step-desc" style={{ fontSize: '0.85rem' }}>{stepObj.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Precautions Accordion */}
            <div className="product-info-accordion">
              <div 
                className={`accordion-header ${productAccordions.precautions ? 'open' : ''}`}
                onClick={() => toggleProductAccordion('precautions')}
              >
                <span className="accordion-title">Precautions</span>
                <span className="accordion-icon">{productAccordions.precautions ? '−' : '+'}</span>
              </div>
              <div className={`accordion-content ${productAccordions.precautions ? 'open' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', background: 'rgba(255, 51, 51, 0.05)', border: '1px solid rgba(255, 51, 51, 0.15)', borderRadius: '4px', marginTop: '0.5rem' }}>
                  <HelpCircle size={18} color="var(--accent-red)" style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--accent-red)', fontWeight: 600 }}>{detailedInfo.warning}</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 1. How People Use Section */}
      {richData && richData.useCases && (
        <section className="rich-use-cases-section scroll-reveal">
          <h2 className="rich-section-title">How People Use {product.name}</h2>
          <p className="rich-section-subtitle">Everyone's fitness journey is different</p>
          <div className="use-cases-grid">
            {richData.useCases.map((uc, idx) => (
              <div key={idx} className="use-case-card">
                <h4>{uc.title}</h4>
                <p>{uc.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. What's Inside Section */}
      {richData && richData.ingredients && (
        <section className="rich-ingredients-section scroll-reveal">
          <h2 className="rich-section-title">What's Inside?</h2>
          <div className="ingredients-chips-row">
            {richData.ingredients.map((ing, idx) => (
              <button
                key={idx}
                className={`ingredient-chip-btn ${activeIngredientIdx === idx ? 'active' : ''}`}
                onClick={() => setActiveIngredientIdx(idx)}
              >
                {ing.name}
              </button>
            ))}
          </div>

          <div className="ingredient-active-detail-card">
            <div className="ingredient-detail-left">
              <div className="ingredient-powder-glow-wrap">
                <svg viewBox="0 0 100 100" className="ingredient-scoop-svg">
                  <defs>
                    <radialGradient id="powder-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="var(--gold-primary)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--gold-primary)" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <circle cx="50%" cy="65%" r="30" fill="url(#powder-glow)" />
                  <path d="M25,65 C25,50 75,50 75,65 Z" fill="rgba(212, 175, 55, 0.4)" stroke="var(--gold-primary)" strokeWidth="1.5" />
                  <path d="M15,68 C20,78 80,78 85,68" stroke="var(--gold-primary)" strokeWidth="2" fill="none" />
                  <rect x="42" y="66" width="16" height="4" rx="2" fill="var(--gold-primary)" />
                  <line x1="50" y1="70" x2="50" y2="85" stroke="var(--gold-primary)" strokeWidth="3" />
                  <line x1="35" y1="85" x2="65" y2="85" stroke="var(--gold-primary)" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div className="ingredient-detail-right">
              <h3>{richData.ingredients[activeIngredientIdx]?.name}</h3>
              <ul>
                <li>
                  <span className="bullet-check">✓</span>
                  {richData.ingredients[activeIngredientIdx]?.description}
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* 3. The Power Behind Every Scoop Section */}
      {richData && richData.powerScoop && (
        <section className="rich-power-scoop-section scroll-reveal">
          <h2 className="rich-section-title">The Power Behind Every Scoop</h2>
          <div className="power-bars-container">
            {richData.powerScoop.map((bar, idx) => (
              <div key={idx} className="power-bar-row">
                <div className="power-bar-meta">
                  <span className="power-bar-name">{bar.name}</span>
                  <span className="power-bar-val">{bar.value}</span>
                </div>
                <div className="power-bar-track">
                  <div 
                    className="power-bar-fill"
                    style={{ width: `${bar.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Product Key Highlights Section */}
      <section className="detail-highlights-section">
        <h2 className="highlights-section-title">KEY HIGHLIGHTS</h2>
        <div className="highlights-grid">
          {getProductHighlights(product.name).map((h, idx) => (
            <div key={idx} className="highlight-card">
              <span className="highlight-icon">{h.icon}</span>
              <span className="highlight-value">{h.value}</span>
              <span className="highlight-label">{h.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose GYMMM TANK Section */}
      <section className="why-choose-section">
        <h2 className="why-choose-title">WHY CHOOSE <span className="gold-text">GYMMM TANK?</span></h2>
        <div className="why-choose-table">
          <div className="why-choose-header-row">
            <div className="why-choose-feature-col">FEATURE</div>
            <div className="why-choose-us-col">GYMMM TANK</div>
            <div className="why-choose-them-col">OTHERS</div>
          </div>
          {getWhyChoosePoints(product.name).map((row, idx) => (
            <div key={idx} className="why-choose-row">
              <div className="why-choose-feature-col">{row.feature}</div>
              <div className="why-choose-us-col"><span className="check-yes">✓</span></div>
              <div className="why-choose-them-col"><span className="check-no">✗</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications Strip */}
      <section className="certifications-strip">
        {getCertifications().map((cert, idx) => (
          <div key={idx} className="cert-badge">
            <span className="cert-icon">{cert.icon}</span>
            <span className="cert-label">{cert.label}</span>
          </div>
        ))}
      </section>

      {/* Product Specific FAQs Section */}
      <section className="detail-faqs-section">
        <h2 className="faqs-title">FREQUENTLY ASKED QUESTIONS</h2>
        <div className="faqs-accordion-list">
          {getProductFaqs(product.name).map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div 
                key={idx} 
                className={`faq-accordion-item ${isOpen ? 'open' : ''}`}
                onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
              >
                <div className="faq-question-bar">
                  <span className="faq-question-text">{faq.q}</span>
                  <span className="faq-toggle-icon">{isOpen ? '−' : '+'}</span>
                </div>
                <div className="faq-answer-content">
                  <p className="faq-answer-text">{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="detail-related-section" style={{ marginTop: '5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '1px', marginBottom: '0.8rem', background: 'linear-gradient(90deg, #ffffff, var(--gold-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RELATED PRODUCTS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {relatedProducts.map((p) => {
              const activePrice = p.salePrice ?? p.price;
              return (
                <div 
                  key={p.id} 
                  className="product-card" 
                  onClick={() => onNavigateToProduct(p.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="product-card-image-wrapper">
                    <img src={p.image} alt={p.name} className="product-card-image" onError={(e) => { (e.target as HTMLImageElement).src = '/images/pre_workout.png' }} />
                  </div>
                  <div className="product-card-content">
                    <span className="product-goal-tag" style={{ alignSelf: 'flex-start' }}>{p.goal}</span>
                    <h3 className="product-title" style={{ fontSize: '1.3rem', margin: '0.5rem 0' }}>{p.name}</h3>
                    <div className="product-pricing">
                      <span className="price-active">₹{Math.round(activePrice).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Floating Bottom Action Bar */}
      <div className={`floating-add-to-bag-bar ${showFloatingBar ? 'show' : ''}`}>
        <div className="floating-bar-content">
          <div className="floating-bar-left">
            <img 
              src={product.image} 
              alt={product.name} 
              className="floating-bar-thumb" 
              onError={(e) => { (e.target as HTMLImageElement).src = '/images/pre_workout.png' }}
            />
            <div className="floating-bar-meta">
              <h4>{product.name}</h4>
              <p>{selectedFlavor !== 'Default' ? `${selectedFlavor} | ` : ''}{currentSizeObj?.name || 'Standard'}</p>
            </div>
          </div>
          <div className="floating-bar-right">
            <button 
              className={`floating-add-btn ${isOutOfStock ? 'disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'OUT OF STOCK' : `ADD TO BAG | ${formatPrice(activePrice)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

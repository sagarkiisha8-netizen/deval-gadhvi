export interface ConditionItem {
  id: string;
  name: string;
  slug: string;
  featuredImage?: string;
  overview: string;
  symptoms: string[];
  causes: string[];
  riskFactors: string[];
  diagnosis: string[];
  treatmentOptions: string[];
  prevention: string[];
  faqs: { question: string; answer: string }[];
  relatedServices: string[];
  ctaText?: string;
  ctaLink?: string;
  seoTitle?: string;
  metaDescription?: string;
  displayOrder: number;
  isActive: boolean;
}

export const DEFAULT_CONDITIONS: ConditionItem[] = [
  {
    id: 'hypertension',
    name: 'Hypertension (High Blood Pressure)',
    slug: 'hypertension-treatment-newark-nj',
    featuredImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
    overview: 'High blood pressure is often referred to as the "silent killer" because it frequently produces no noticeable symptoms until severe cardiovascular damage has occurred. At Newark Medical Associates, our board-certified internists provide comprehensive blood pressure mapping, lifestyle guidance, and personalized pharmacotherapy.',
    symptoms: [
      'Often symptomless in early stages',
      'Occasional morning headaches or dull head pressure',
      'Shortness of breath during exertion',
      'Dizziness or lightheadedness',
      'Blurred or disturbed vision',
      'Chest tightness or palpitations'
    ],
    causes: [
      'Arterial stiffness and vascular aging',
      'Excess sodium intake and processed foods',
      'Sedentary lifestyle and lack of aerobic exercise',
      'Chronic unmanaged emotional stress',
      'Secondary causes: Kidney dysfunction, sleep apnea, thyroid disease'
    ],
    riskFactors: [
      'Age over 40',
      'Family history of hypertension or stroke',
      'Obesity or elevated BMI',
      'Tobacco use and high alcohol consumption',
      'Diabetes and high cholesterol comorbidities'
    ],
    diagnosis: [
      'In-office calibrated automated blood pressure monitoring (AOBP)',
      '24-hour ambulatory blood pressure monitoring guidance',
      'Baseline 12-lead EKG to evaluate cardiac chamber enlargement',
      'On-site metabolic blood panel and urinalysis to assess kidney function'
    ],
    treatmentOptions: [
      'Personalized DASH diet counseling and sodium reduction',
      'Targeted aerobic exercise prescriptions',
      'First-line antihypertensive therapy (ACE inhibitors, ARBs, CCBs, thiazides)',
      'Digital home blood pressure log review and dose titration'
    ],
    prevention: [
      'Annual preventive blood pressure checkups',
      'Limiting daily sodium intake below 2,300 mg',
      'Maintaining a healthy body weight',
      'Prioritizing 7-8 hours of quality sleep nightly'
    ],
    faqs: [
      {
        question: 'What is considered a normal blood pressure reading?',
        answer: 'According to American Heart Association guidelines, normal blood pressure is systolic under 120 mmHg and diastolic under 80 mmHg. Readings consistently above 130/80 mmHg indicate hypertension.'
      },
      {
        question: 'Can hypertension be managed without lifelong medication?',
        answer: 'In early or borderline stages, proactive lifestyle modifications—such as dietary changes, weight loss, and exercise—can sometimes return readings to healthy ranges. When medication is required, it protects against strokes, heart attacks, and kidney failure.'
      }
    ],
    relatedServices: ['Primary Care', 'Cardiology Diagnostics', 'Preventive Medicine'],
    ctaText: 'Schedule a Blood Pressure Check',
    ctaLink: '/appointments',
    seoTitle: 'Hypertension Treatment Newark NJ | High Blood Pressure Doctor',
    metaDescription: 'Expert hypertension management, blood pressure mapping, and cardiovascular care in Newark, NJ with board-certified internal medicine physicians.',
    displayOrder: 1,
    isActive: true
  },
  {
    id: 'type-2-diabetes',
    name: 'Type 2 Diabetes & Pre-Diabetes',
    slug: 'diabetes-management-newark-nj',
    featuredImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800',
    overview: 'Type 2 diabetes is a progressive metabolic condition characterized by insulin resistance and elevated blood glucose. Newark Medical Associates offers proactive HbA1c testing, continuous glucose monitoring education, medical weight loss, and modern diabetic medications to prevent vascular complications.',
    symptoms: [
      'Increased thirst and dry mouth (polydipsia)',
      'Frequent urination, especially at night (polyuria)',
      'Unexplained chronic fatigue and low energy',
      'Slow-healing cuts, scratches, or bruises',
      'Tingling, numbness, or burning in hands or feet (neuropathy)',
      'Blurry or fluctuating vision'
    ],
    causes: [
      'Insulin resistance in muscle, liver, and fat tissues',
      'Genetic predisposition and pancreatic beta-cell fatigue',
      'Metabolic syndrome and visceral abdominal adiposity'
    ],
    riskFactors: [
      'Pre-diabetes diagnosis or fasting glucose > 100 mg/dL',
      'Overweight or obesity',
      'Age 45 or older',
      'Sedentary lifestyle',
      'History of gestational diabetes'
    ],
    diagnosis: [
      'On-site Hemoglobin A1c (HbA1c) blood testing',
      'Fasting plasma glucose evaluation',
      'Lipid panel and comprehensive metabolic profile (CMP)',
      'Urine microalbumin test for early kidney nephropathy detection'
    ],
    treatmentOptions: [
      'Continuous medical nutrition counseling and carbohydrate monitoring',
      'Metformin and modern GLP-1 receptor agonists / SGLT2 inhibitors',
      'Insulin therapy regimens when clinically indicated',
      'Annual diabetic foot and retinal screening coordination'
    ],
    prevention: [
      'Moderate 150 minutes of weekly cardiovascular activity',
      'Nutrient-dense, low-glycemic Mediterranean dietary patterns',
      'Annual fasting blood glucose testing for adults over 35'
    ],
    faqs: [
      {
        question: 'What is the difference between pre-diabetes and diabetes?',
        answer: 'Pre-diabetes is defined by an HbA1c between 5.7% and 6.4%, indicating insulin resistance before irreversible pancreatic damage occurs. Type 2 diabetes is diagnosed at an HbA1c of 6.5% or higher.'
      },
      {
        question: 'Can Type 2 Diabetes go into remission?',
        answer: 'Yes! Significant weight loss, low-glycemic dietary changes, and sustained physical activity can frequently bring blood sugars back into non-diabetic ranges without medications.'
      }
    ],
    relatedServices: ['Primary Care', 'Medical Weight Loss', 'In-Office Phlebotomy'],
    ctaText: 'Schedule a Diabetes Consultation',
    ctaLink: '/appointments',
    seoTitle: 'Diabetes Doctor Newark NJ | Type 2 Diabetes & Pre-Diabetes Treatment',
    metaDescription: 'Personalized Type 2 diabetes management, HbA1c testing, and preventive endocrinology in Newark, NJ at Newark Medical Associates.',
    displayOrder: 2,
    isActive: true
  },
  {
    id: 'high-cholesterol',
    name: 'Hyperlipidemia & High Cholesterol',
    slug: 'high-cholesterol-treatment-newark-nj',
    featuredImage: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800',
    overview: 'High cholesterol causes plaque buildup inside arterial walls, significantly raising the lifetime risk of coronary heart disease and ischemic stroke. Our Newark clinic provides complete lipid panels, cardiovascular risk calculators, and targeted therapies.',
    symptoms: [
      'Usually silent with zero noticeable symptoms until vascular occlusion occurs',
      'Xanthomas (fatty deposits beneath the skin or around eyelids)',
      'Angina or chest heaviness during exertion if coronary arteries are narrowed'
    ],
    causes: [
      'Dietary excess of saturated and trans fats',
      'Familial hypercholesterolemia (genetic elevation of LDL)',
      'Underlying metabolic syndrome or untreated hypothyroidism'
    ],
    riskFactors: [
      'Smoking and tobacco exposure',
      'Family history of early coronary heart disease',
      'Uncontrolled hypertension or type 2 diabetes',
      'High-stress lifestyle and poor dietary habits'
    ],
    diagnosis: [
      'Fast lipid panel (Total Cholesterol, LDL-C, HDL-C, Triglycerides)',
      'High-sensitivity C-reactive protein (hs-CRP) inflammatory marker',
      'Cardiovascular 10-year ASCVD risk calculation',
      'In-office EKG and echocardiogram for cardiac assessment'
    ],
    treatmentOptions: [
      'Evidence-based statin therapy (Atorvastatin, Rosuvastatin)',
      'Non-statin therapies: Ezetimibe and PCSK9 inhibitors',
      'Cardioprotective nutrition plan rich in soluble fiber and healthy fats'
    ],
    prevention: [
      'Daily intake of oat bran, legumes, nuts, and omega-3 fatty acids',
      'Complete smoking cessation',
      'Routine annual lipid profile testing'
    ],
    faqs: [
      {
        question: 'How often should adults get their cholesterol tested?',
        answer: 'Healthy adults should undergo a complete lipid panel every 4 to 6 years, while patients with hypertension, diabetes, or family history of heart disease should be tested annually.'
      }
    ],
    relatedServices: ['Preventive Medicine', 'Cardiology Diagnostics', 'Primary Care'],
    ctaText: 'Request a Lipid Profile',
    ctaLink: '/appointments',
    seoTitle: 'Cholesterol Doctor Newark NJ | Lipid Panel & Heart Care',
    metaDescription: 'Complete lipid profile testing, cholesterol treatment, and cardiovascular risk reduction in Newark, NJ.',
    displayOrder: 3,
    isActive: true
  },
  {
    id: 'asthma-copd',
    name: 'Asthma & Chronic Respiratory Conditions',
    slug: 'asthma-copd-treatment-newark-nj',
    featuredImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
    overview: 'Chronic respiratory diseases such as asthma and COPD lead to airway inflammation, wheezing, and reduced lung capacity. Our Newark physicians provide spirometry evaluations, rescue and controller inhaler management, and environmental trigger identification.',
    symptoms: [
      'Persistent wheezing, whistling chest sounds, or coughing fits',
      'Shortness of breath triggered by exertion, cold air, or allergens',
      'Chest tightness or feeling unable to take a full breath',
      'Frequent respiratory infections or prolonged bronchitis'
    ],
    causes: [
      'Airway hyperreactivity and chronic bronchial inflammation',
      'Long-term exposure to tobacco smoke or urban air pollutants',
      'Allergens: Mold, pollen, dust mites, pet dander'
    ],
    riskFactors: [
      'History of childhood asthma or seasonal allergies',
      'Occupational exposure to chemical fumes or dust',
      'Secondhand smoke exposure'
    ],
    diagnosis: [
      'Clinical pulmonary examination and pulse oximetry',
      'Peak flow monitoring and spirometry lung function review',
      'Chest imaging coordination when pulmonary consolidation is suspected'
    ],
    treatmentOptions: [
      'Inhaled corticosteroids (ICS) for daily anti-inflammatory airway control',
      'Short-acting beta-agonists (SABA) for rapid rescue bronchodilation',
      'Combination LABA/ICS inhalers and leukotriene receptor antagonists',
      'Personalized Asthma Action Plan for work, school, and home'
    ],
    prevention: [
      'Annual influenza and pneumococcal immunizations',
      'HEPA air filtration at home',
      'Avoiding known smoke and chemical triggers'
    ],
    faqs: [
      {
        question: 'What should I do during an acute asthma flare-up?',
        answer: 'Follow your individualized Asthma Action Plan by using your prescribed quick-relief rescue inhaler immediately. If severe shortness of breath persists, seek emergency medical care immediately.'
      }
    ],
    relatedServices: ['Primary Care', 'Acute Care', 'Preventive Medicine'],
    ctaText: 'Schedule a Respiratory Consultation',
    ctaLink: '/appointments',
    seoTitle: 'Asthma & COPD Doctor Newark NJ | Pulmonary Care Clinic',
    metaDescription: 'Expert asthma treatment, chronic respiratory care, and inhaler management in Newark, NJ with experienced physicians.',
    displayOrder: 4,
    isActive: true
  },
  {
    id: 'thyroid-disorders',
    name: 'Thyroid Disorders (Hypothyroidism & Hyperthyroidism)',
    slug: 'thyroid-disorders-treatment-newark-nj',
    featuredImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800',
    overview: 'The thyroid gland regulates metabolism, body temperature, energy expenditure, and heart rate. We diagnose and treat underactive thyroid (hypothyroidism/Hashimoto’s) and overactive thyroid (hyperthyroidism/Graves’) through targeted blood hormone testing and medication balancing.',
    symptoms: [
      'Hypothyroidism: Unexplained fatigue, weight gain, cold intolerance, dry skin, constipation',
      'Hyperthyroidism: Rapid heartbeat, unexplained weight loss, heat intolerance, trembling hands, anxiety',
      'Swelling or lump at the base of the neck (goiter)'
    ],
    causes: [
      'Autoimmune thyroiditis (Hashimoto’s thyroiditis or Graves’ disease)',
      'Thyroid nodules or cysts',
      'Post-viral inflammation or hormonal fluctuations'
    ],
    riskFactors: [
      'Female gender (5-8 times more common in women)',
      'Personal or family history of autoimmune conditions',
      'Age over 50'
    ],
    diagnosis: [
      'Serum Thyroid Stimulating Hormone (TSH) testing',
      'Free T4 and Free T3 thyroid hormone levels',
      'Thyroperoxidase antibodies (TPOAb) for autoimmune confirmation',
      'On-site neck and thyroid ultrasound evaluation'
    ],
    treatmentOptions: [
      'Levothyroxine replacement therapy with precise dosage titration',
      'Antithyroid medications (Methimazole) for hyperthyroid conditions',
      'Serial laboratory monitoring every 6-12 weeks until stabilization'
    ],
    prevention: [
      'Routine thyroid screening for adults presenting with chronic fatigue or weight changes',
      'Balanced dietary iodine intake'
    ],
    faqs: [
      {
        question: 'How long does it take for thyroid medication to work?',
        answer: 'Most patients experience marked improvement in energy, mental clarity, and metabolic symptoms within 2 to 4 weeks after initiating levothyroxine.'
      }
    ],
    relatedServices: ['Primary Care', 'On-Site Phlebotomy', 'Ultrasound Diagnostics'],
    ctaText: 'Check Your Thyroid Levels',
    ctaLink: '/appointments',
    seoTitle: 'Thyroid Doctor Newark NJ | Hypothyroidism & Hashimoto’s Care',
    metaDescription: 'Comprehensive thyroid testing, TSH panels, ultrasound, and hormone management in Newark, NJ at Newark Medical Associates.',
    displayOrder: 5,
    isActive: true
  }
];

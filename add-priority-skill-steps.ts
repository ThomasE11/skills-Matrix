
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const skillSteps = {
  "269": [ // PAEDIATRIC CPR WITH MANUAL DEFIBRILLATOR
    {
      "stepNumber": 1,
      "title": "Scene Safety and Initial Assessment",
      "description": "Ensure scene safety and approach the pediatric patient. Assess responsiveness by shouting and gently tapping the child's shoulders. Check for normal breathing and signs of life.",
      "keyPoints": ["Ensure personal safety first", "Use gentle stimulation for pediatric patients", "Look for chest rise and fall", "Check for pulse if trained", "Call for additional help immediately"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 2,
      "title": "Activate Emergency Response and Position Patient",
      "description": "Call for emergency medical services and request pediatric AED/defibrillator. Position the child on a firm, flat surface with head in neutral position. Open airway using head-tilt chin-lift or jaw thrust if spinal injury suspected.",
      "keyPoints": ["Use speaker phone to maintain hands-free communication", "Firm surface is essential for effective compressions", "Avoid hyperextension of neck in infants", "Consider spinal precautions if trauma suspected", "Ensure adequate lighting"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 3,
      "title": "Provide Initial Rescue Breaths",
      "description": "Deliver 5 initial rescue breaths using bag-mask ventilation with 100% oxygen. For infants, use mouth-to-nose/mouth technique if bag-mask unavailable. Ensure adequate chest rise with each breath.",
      "keyPoints": ["Use appropriate sized mask for proper seal", "Deliver breaths over 1 second each", "Watch for chest rise with each breath", "Avoid excessive ventilation pressure", "Use two-person bag-mask technique when possible"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 4,
      "title": "Assess for Signs of Life",
      "description": "After rescue breaths, quickly assess for signs of life including pulse, breathing, movement, or coughing. If no signs of life are present, immediately begin chest compressions.",
      "keyPoints": ["Check brachial pulse in infants, carotid in children", "Assessment should take no more than 10 seconds", "Look for any spontaneous movement", "If uncertain about pulse, begin compressions", "Maintain airway positioning"],
      "isCritical": true,
      "timeEstimate": 0.5
    },
    {
      "stepNumber": 5,
      "title": "Begin High-Quality Chest Compressions",
      "description": "Start chest compressions at correct location: lower half of breastbone for infants and children. Use appropriate technique - two fingers for infants, heel of one hand for small children, two hands for larger children. Compress at least 1/3 of chest depth.",
      "keyPoints": ["Compression rate 100-120 per minute", "Allow complete chest recoil between compressions", "Minimize interruptions", "Switch compressors every 2 minutes", "Ensure proper hand placement"],
      "isCritical": true,
      "timeEstimate": 2
    },
    {
      "stepNumber": 6,
      "title": "Establish CPR Ratio and Attach Monitor",
      "description": "Perform CPR with 15:2 compression to ventilation ratio for healthcare providers. Attach cardiac monitor/defibrillator as soon as available. Use pediatric pads if available, adult pads if pediatric unavailable.",
      "keyPoints": ["15 compressions to 2 breaths for healthcare providers", "Use pediatric energy settings if available", "Ensure pads don't touch each other", "Continue CPR while applying pads", "Front-back pad placement acceptable for small children"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 7,
      "title": "Analyze Rhythm and Determine Shockable Status",
      "description": "Pause compressions briefly to analyze cardiac rhythm. Identify if rhythm is shockable (VF/pVT) or non-shockable (PEA/Asystole). Ensure all team members are clear of patient during analysis.",
      "keyPoints": ["Minimize interruption time to less than 10 seconds", "Clearly communicate rhythm findings", "Ensure everyone is clear of patient", "Be prepared to resume CPR immediately", "Document rhythm and time"],
      "isCritical": true,
      "timeEstimate": 0.5
    },
    {
      "stepNumber": 8,
      "title": "Deliver Shock if Indicated (Shockable Rhythm)",
      "description": "If VF or pVT present, deliver shock at 4 Joules/kg. Ensure all personnel are clear, charge defibrillator, and deliver shock. Immediately resume CPR starting with compressions without pulse check.",
      "keyPoints": ["Use 4 J/kg for pediatric defibrillation", "Ensure complete clearance before shocking", "Resume CPR immediately after shock", "No pulse check immediately post-shock", "Document energy level and time"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 9,
      "title": "Continue CPR and Prepare Medications",
      "description": "Resume high-quality CPR for 2 minutes. Establish IV/IO access if not already done. Prepare epinephrine 10 mcg/kg (1:10,000) for administration after 2nd shock or immediately for non-shockable rhythms.",
      "keyPoints": ["Maintain high-quality compressions", "IO access often faster than IV in children", "Calculate weight-based drug doses", "Prepare epinephrine and amiodarone", "Continue effective ventilation"],
      "isCritical": true,
      "timeEstimate": 2
    },
    {
      "stepNumber": 10,
      "title": "Administer Medications (After 3rd and 5th Shocks)",
      "description": "After 3rd shock, administer epinephrine 10 mcg/kg IV/IO and amiodarone 5 mg/kg IV/IO. Repeat epinephrine every alternate cycle. Give second dose of amiodarone after 5th shock only.",
      "keyPoints": ["Epinephrine maximum single dose 1 mg", "Amiodarone maximum single dose 300 mg", "Flush medications with saline", "Continue CPR during drug administration", "Document all medications and times"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 11,
      "title": "Address Reversible Causes (4 Hs and 4 Ts)",
      "description": "Systematically consider and treat reversible causes: Hypoxia, Hypovolemia, Hyper/hypokalemia, Hypothermia, Thrombosis, Tension pneumothorax, Tamponade, and Toxins.",
      "keyPoints": ["Ensure adequate oxygenation and ventilation", "Consider fluid bolus for hypovolemia", "Check blood glucose", "Maintain normal body temperature", "Consider specific antidotes if poisoning suspected"],
      "isCritical": true,
      "timeEstimate": 2
    },
    {
      "stepNumber": 12,
      "title": "Monitor for Return of Spontaneous Circulation (ROSC)",
      "description": "Continuously monitor for signs of ROSC including palpable pulse, blood pressure, end-tidal CO2 rise, or spontaneous movement. If ROSC achieved, begin post-cardiac arrest care.",
      "keyPoints": ["Check pulse during rhythm analysis", "Watch for sudden rise in ETCO2", "Look for spontaneous breathing", "Monitor blood pressure if ROSC", "Be prepared to resume CPR if pulse lost"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 13,
      "title": "Post-ROSC Care and Stabilization",
      "description": "If ROSC achieved, optimize oxygenation (SpO2 94-98%), maintain normal blood pressure, control temperature, and prepare for transport. Continue monitoring and be ready to resume CPR if needed.",
      "keyPoints": ["Avoid hyperoxemia and hypoxemia", "Maintain systolic BP appropriate for age", "Prevent hyperthermia", "Consider targeted temperature management", "Prepare for immediate transport"],
      "isCritical": true,
      "timeEstimate": 3
    }
  ],
  "273": [ // Troubleshooting ventilator alarms
    {
      "stepNumber": 1,
      "title": "Immediate Patient Assessment and Safety",
      "description": "Immediately assess patient's level of consciousness, breathing effort, chest wall movement, and overall distress. Check pulse oximetry and observe for signs of acute respiratory distress including use of accessory muscles, diaphoresis, or cyanosis.",
      "keyPoints": ["Patient safety is the absolute priority", "Look for signs of acute distress", "Check SpO2 and vital signs", "Assess chest wall movement", "Be prepared to disconnect and manually ventilate"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 2,
      "title": "Silence Alarm and Identify Alarm Type",
      "description": "Silence the ventilator alarm to allow focused assessment. Identify the specific alarm type (high pressure, low pressure, apnea, low tidal volume, etc.) and note any accompanying messages or indicators on the ventilator display.",
      "keyPoints": ["Silence alarm to reduce noise and stress", "Read alarm message carefully", "Note multiple simultaneous alarms", "Check ventilator display for additional information", "Document alarm type and time"],
      "isCritical": false,
      "timeEstimate": 0.5
    },
    {
      "stepNumber": 3,
      "title": "Perform Rapid Physical Examination",
      "description": "Quickly auscultate chest for breath sounds bilaterally, check for symmetric chest rise, palpate for subcutaneous emphysema, and assess neck veins. Look for obvious circuit disconnections or kinks.",
      "keyPoints": ["Listen for bilateral breath sounds", "Check for symmetric chest expansion", "Palpate for subcutaneous emphysema", "Assess jugular venous distention", "Visually inspect ventilator circuit"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 4,
      "title": "Disconnect and Manual Ventilation if Severe Distress",
      "description": "If patient shows severe distress, immediately disconnect from ventilator and begin manual ventilation with bag-valve-mask using 100% oxygen. Assess lung compliance and resistance manually while ventilating.",
      "keyPoints": ["Disconnect immediately if patient in severe distress", "Use 100% oxygen for manual ventilation", "Maintain PEEP if patient was on high PEEP (≥10 cmH2O)", "Feel for lung compliance and resistance", "Normal ventilating pressures should not exceed 40 cmH2O"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 5,
      "title": "Assess Airway Patency",
      "description": "Pass a suction catheter through the endotracheal tube to check for patency and clear any secretions. Ensure the ETT is properly positioned and not kinked, bitten, or displaced.",
      "keyPoints": ["Suction catheter should pass easily", "Clear any secretions or mucus plugs", "Check ETT position at teeth/lips", "Look for kinking or biting of tube", "Ensure cuff is properly inflated"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 6,
      "title": "Troubleshoot High Pressure Alarms",
      "description": "For high peak pressure alarms, differentiate between increased airway resistance and decreased lung compliance. Check plateau pressure if possible. Address causes like secretions, bronchospasm, pneumothorax, or circuit problems.",
      "keyPoints": ["High PIP with normal plateau = airway resistance problem", "High PIP and plateau = lung compliance problem", "Suction for secretions", "Consider bronchodilators for wheezing", "Rule out pneumothorax if sudden onset"],
      "isCritical": true,
      "timeEstimate": 2
    },
    {
      "stepNumber": 7,
      "title": "Troubleshoot Low Pressure Alarms",
      "description": "For low pressure alarms, systematically check for circuit disconnections, loose connections, and cuff leaks. Reconnect any disconnected components and check ETT cuff pressure.",
      "keyPoints": ["Most commonly due to disconnection", "Check all circuit connections", "Verify ETT cuff inflation", "Look for visible circuit leaks", "Ensure patient hasn't self-extubated"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 8,
      "title": "Address Apnea and Volume Alarms",
      "description": "For apnea alarms, assess patient's respiratory drive and ensure adequate sedation levels. For volume alarms, check for leaks, patient effort changes, and appropriate ventilator settings including trigger sensitivity.",
      "keyPoints": ["Assess patient's spontaneous breathing effort", "Check sedation level appropriateness", "Verify trigger sensitivity settings", "Look for patient-ventilator asynchrony", "Adjust settings as needed"],
      "isCritical": true,
      "timeEstimate": 2
    },
    {
      "stepNumber": 9,
      "title": "Check Gas Supply and Power Sources",
      "description": "Verify oxygen and air supply pressures are adequate. Check electrical power connection and battery status. Ensure gas supply lines are properly connected and not kinked.",
      "keyPoints": ["Check oxygen tank levels or wall supply", "Verify air supply if using blended gas", "Ensure power cord is connected", "Check battery backup status", "Inspect gas supply lines"],
      "isCritical": false,
      "timeEstimate": 1
    },
    {
      "stepNumber": 10,
      "title": "Evaluate Patient-Ventilator Synchrony",
      "description": "Assess for patient-ventilator asynchrony by observing breathing patterns, checking trigger sensitivity, and adjusting flow rates or inspiratory time as needed. Look for signs of auto-PEEP.",
      "keyPoints": ["Watch for patient 'fighting' the ventilator", "Check trigger sensitivity settings", "Assess for auto-PEEP", "Consider sedation if patient is agitated", "Adjust flow rates for patient comfort"],
      "isCritical": false,
      "timeEstimate": 2
    },
    {
      "stepNumber": 11,
      "title": "Consider Life-Threatening Emergencies",
      "description": "If patient condition continues to deteriorate, consider and treat pneumothorax (needle decompression) and complete airway obstruction. Be prepared for emergency procedures.",
      "keyPoints": ["Consider tension pneumothorax if sudden deterioration", "Prepare for needle decompression if indicated", "Check for complete airway obstruction", "Have emergency airway equipment ready", "Consider emergency surgical airway if needed"],
      "isCritical": true,
      "timeEstimate": 2
    },
    {
      "stepNumber": 12,
      "title": "Reconnect and Monitor Response",
      "description": "Once issues are addressed, reconnect patient to ventilator and closely monitor response. Adjust alarm limits appropriately and continue to assess patient comfort and ventilation adequacy.",
      "keyPoints": ["Reconnect only after issues resolved", "Monitor patient response closely", "Adjust alarm limits appropriately", "Continue frequent reassessment", "Document interventions and patient response"],
      "isCritical": false,
      "timeEstimate": 2
    }
  ],
  "301": [ // Adult Endotracheal Intubation (ETT)
    {
      "stepNumber": 1,
      "title": "Gather Equipment and Perform Safety Check",
      "description": "Assemble all necessary equipment using SOAP-ME approach: Suction, Oxygenation equipment, Airway tools, Pharmaceuticals, Monitoring equipment, and Emergency backup. Test laryngoscope light and check ETT cuff integrity.",
      "keyPoints": ["Use systematic equipment checklist", "Test laryngoscope light brightness", "Check ETT cuff for leaks", "Ensure suction is working", "Have backup equipment ready"],
      "isCritical": true,
      "timeEstimate": 2
    },
    {
      "stepNumber": 2,
      "title": "Patient Assessment and Airway Evaluation",
      "description": "Perform focused history and physical examination. Assess airway using LEMON criteria: Look externally, Evaluate 3-3-2 rule, Mallampati score, Obstruction, and Neck mobility. Identify potential difficult airway predictors.",
      "keyPoints": ["Use LEMON assessment systematically", "Check mouth opening (3 fingers)", "Assess thyromental distance", "Evaluate neck mobility", "Note any anatomical abnormalities"],
      "isCritical": true,
      "timeEstimate": 2
    },
    {
      "stepNumber": 3,
      "title": "Position Patient and Prepare Team",
      "description": "Position patient in sniffing position with head elevated and neck extended. For obese patients, use ramp positioning. Assign team roles: operator, medication administrator, respiratory assistant, and C-spine stabilizer if needed.",
      "keyPoints": ["Align ear with sternal notch", "Use ramp for obese patients", "Ensure clear team role assignments", "Maintain C-spine precautions if trauma", "Position at appropriate height for operator"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 4,
      "title": "Pre-oxygenation",
      "description": "Administer 100% oxygen via bag-mask ventilation for 3-5 minutes to achieve nitrogen washout. Ensure good mask seal and adequate ventilation. Monitor oxygen saturation and aim for SpO2 >95%.",
      "keyPoints": ["Use 100% oxygen for 3-5 minutes", "Ensure tight mask seal", "Avoid gastric insufflation", "Monitor SpO2 continuously", "Consider apneic oxygenation setup"],
      "isCritical": true,
      "timeEstimate": 3
    },
    {
      "stepNumber": 5,
      "title": "Administer RSI Medications",
      "description": "Administer rapid sequence intubation medications: sedative (propofol, etomidate, or ketamine) followed immediately by paralytic (succinylcholine or rocuronium). Verify unconsciousness before proceeding.",
      "keyPoints": ["Give medications within 30 seconds of each other", "Verify patient unconsciousness", "Use appropriate weight-based dosing", "Have reversal agents available", "Monitor for adverse reactions"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 6,
      "title": "Perform Laryngoscopy",
      "description": "Insert laryngoscope blade into right side of mouth, sweep tongue left, and advance to appropriate position. For curved blade, place in vallecula; for straight blade, lift epiglottis directly. Lift handle upward at 45-degree angle.",
      "keyPoints": ["Insert blade on right side of mouth", "Sweep tongue to the left", "Lift upward, don't lever on teeth", "Maintain steady upward pressure", "Visualize vocal cords clearly"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 7,
      "title": "Insert Endotracheal Tube",
      "description": "Under direct visualization, insert ETT through vocal cords until cuff disappears beyond cords. Hold tube firmly in place, remove laryngoscope, and withdraw stylet. Inflate cuff with 5-10ml air.",
      "keyPoints": ["Insert under direct visualization", "Pass cuff just beyond vocal cords", "Hold tube securely during stylet removal", "Inflate cuff to appropriate pressure", "Limit attempt to 30 seconds maximum"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 8,
      "title": "Confirm Tube Placement - Primary",
      "description": "Immediately attach end-tidal CO2 detector and bag-valve device. Confirm placement with sustained CO2 waveform capnography. This is the most reliable method of confirming tracheal placement.",
      "keyPoints": ["EtCO2 is gold standard for confirmation", "Look for sustained waveform", "Absence of CO2 indicates esophageal placement", "Attach monitoring immediately", "Document EtCO2 values"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 9,
      "title": "Confirm Tube Placement - Secondary",
      "description": "Perform secondary confirmation: auscultate bilateral breath sounds over lung fields and absent sounds over epigastrium, observe symmetric chest rise, and check for tube fogging. Assess improvement in oxygen saturation.",
      "keyPoints": ["Listen over both lung fields", "Confirm absent epigastric sounds", "Watch for symmetric chest movement", "Look for tube fogging", "Monitor SpO2 improvement"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 10,
      "title": "Secure Endotracheal Tube",
      "description": "Secure ETT with appropriate device or tape, noting depth at teeth/lips (typically 21cm for women, 23cm for men at teeth). Ensure securing method doesn't compromise venous return or airway.",
      "keyPoints": ["Note and document tube depth", "Use appropriate securing method", "Avoid neck compression", "Recheck tube position after securing", "Consider commercial securing devices"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 11,
      "title": "Connect to Ventilator and Set Parameters",
      "description": "Connect ETT to mechanical ventilator or continue manual ventilation. Set appropriate ventilator parameters: tidal volume 6-8ml/kg ideal body weight, respiratory rate 12-16, PEEP 5cmH2O, FiO2 to maintain SpO2 92-98%.",
      "keyPoints": ["Use ideal body weight for tidal volume", "Start with conservative settings", "Monitor plateau pressures <30 cmH2O", "Titrate FiO2 to appropriate SpO2", "Avoid hyperventilation"],
      "isCritical": false,
      "timeEstimate": 2
    },
    {
      "stepNumber": 12,
      "title": "Post-Intubation Monitoring and Documentation",
      "description": "Continuously monitor patient's vital signs, oxygen saturation, EtCO2, and ventilator parameters. Document procedure details including indication, technique used, number of attempts, complications, and patient response.",
      "keyPoints": ["Monitor continuously for complications", "Watch for tube displacement", "Document all procedure details", "Note any complications", "Prepare for transport if prehospital"],
      "isCritical": false,
      "timeEstimate": 3
    }
  ],
  "290": [ // Prediction of difficult direct endotracheal intubation
    {
      "stepNumber": 1,
      "title": "Initial Patient Observation and History",
      "description": "Begin systematic assessment by observing patient's overall appearance and gathering relevant history including previous intubation experiences, known airway abnormalities, and current medical conditions that might affect airway management.",
      "keyPoints": ["Note overall patient appearance", "Ask about previous difficult intubations", "Identify relevant medical conditions", "Check for emergency vs elective situation", "Assess patient cooperation level"],
      "isCritical": false,
      "timeEstimate": 2
    },
    {
      "stepNumber": 2,
      "title": "L - Look Externally for Anatomical Features",
      "description": "Systematically examine external facial and neck anatomy. Look for facial trauma, burns, masses, beard, prominent incisors, small mouth opening, short neck, large tongue, or any anatomical abnormalities that could complicate intubation.",
      "keyPoints": ["Examine face and neck systematically", "Note facial trauma or burns", "Assess for beard or facial hair", "Look for prominent upper incisors", "Identify neck masses or swelling"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 3,
      "title": "E - Evaluate 3-3-2 Rule: Mouth Opening",
      "description": "Assess mouth opening by asking patient to open mouth maximally. Measure inter-incisor distance - should accommodate 3 finger breadths (approximately 3cm) between upper and lower incisors. Document if less than 3 fingers can fit.",
      "keyPoints": ["Use patient's own fingers for measurement", "Normal is 3 finger breadths", "Less than 3cm indicates potential difficulty", "Consider trismus or TMJ problems", "Document actual measurement"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 4,
      "title": "E - Evaluate 3-3-2 Rule: Hyomental Distance",
      "description": "Measure distance from tip of chin (mentum) to hyoid bone with neck extended. Should accommodate 3 finger breadths (approximately 6cm). This assesses pharyngeal space available for intubation.",
      "keyPoints": ["Measure from chin tip to hyoid bone", "Neck should be extended during measurement", "Normal is 3 finger breadths (6cm)", "Less than 6cm suggests difficult laryngoscopy", "Palpate hyoid bone carefully"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 5,
      "title": "E - Evaluate 3-3-2 Rule: Thyrohyoid Distance",
      "description": "Measure distance between hyoid bone and thyroid cartilage (Adam's apple). Should accommodate 2 finger breadths. Reduced distance suggests high laryngeal position making visualization difficult.",
      "keyPoints": ["Measure hyoid to thyroid cartilage", "Normal is 2 finger breadths", "Reduced distance indicates high larynx", "Palpate landmarks gently", "Consider anatomical variations"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 6,
      "title": "M - Assess Mallampati Classification",
      "description": "With patient seated upright, head neutral, mouth fully open, and tongue maximally protruded (without phonation), classify visibility of oral structures. Grade I-II generally easier, Grade III-IV suggests potential difficulty.",
      "keyPoints": ["Patient should be upright if possible", "No phonation during assessment", "Tongue maximally protruded", "Grade III-IV indicates potential difficulty", "Document specific class observed"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 7,
      "title": "O - Assess for Obstruction",
      "description": "Evaluate for any conditions causing airway obstruction including foreign bodies, tumors, soft tissue swelling, epiglottitis, angioedema, hematoma, or trauma. Listen for stridor or abnormal breathing sounds.",
      "keyPoints": ["Listen for stridor carefully", "Assess for soft tissue swelling", "Consider epiglottitis or angioedema", "Look for trauma-related obstruction", "Evaluate breathing pattern"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 8,
      "title": "N - Evaluate Neck Mobility",
      "description": "Assess patient's ability to extend neck and achieve sniffing position. Ask cooperative patients to extend neck backward. Limited mobility may indicate cervical spine issues, arthritis, or previous surgery.",
      "keyPoints": ["Test neck extension ability", "Assess sniffing position capability", "Consider cervical spine precautions", "Note arthritis or previous surgery", "Document range of motion"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 9,
      "title": "Additional Assessment: Upper Lip Bite Test",
      "description": "Ask patient to bite their upper lip with lower incisors. Class I (lower incisors bite upper lip above vermillion border) is normal. Class II-III suggest increasing difficulty with mandibular protrusion.",
      "keyPoints": ["Assess mandibular protrusion ability", "Class I is normal finding", "Class II-III suggest difficulty", "Tests jaw mobility", "Simple bedside test"],
      "isCritical": false,
      "timeEstimate": 1
    },
    {
      "stepNumber": 10,
      "title": "Assess Special Circumstances",
      "description": "Consider additional factors: obesity (BMI >30), pregnancy, emergency vs elective setting, patient cooperation, time constraints, and availability of backup equipment or personnel.",
      "keyPoints": ["Consider obesity as risk factor", "Emergency situations increase difficulty", "Assess patient cooperation level", "Note time constraints", "Ensure backup plans available"],
      "isCritical": false,
      "timeEstimate": 1
    },
    {
      "stepNumber": 11,
      "title": "Synthesize Findings and Risk Stratification",
      "description": "Combine all assessment findings to determine overall difficulty prediction. Multiple positive findings increase likelihood of difficult intubation. Consider cumulative risk rather than single factors.",
      "keyPoints": ["Consider all findings together", "Multiple factors increase risk", "No single test is perfectly predictive", "Use clinical judgment", "Document overall assessment"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 12,
      "title": "Formulate Airway Management Plan",
      "description": "Based on assessment, develop primary and backup airway management strategies. Consider awake intubation, video laryngoscopy, supraglottic devices, or surgical airway options. Ensure team is prepared.",
      "keyPoints": ["Develop primary and backup plans", "Consider alternative techniques", "Ensure appropriate equipment available", "Brief team on plan", "Have rescue devices ready"],
      "isCritical": true,
      "timeEstimate": 2
    },
    {
      "stepNumber": 13,
      "title": "Documentation and Communication",
      "description": "Document all assessment findings, predicted difficulty level, and planned approach. Communicate findings to team members and ensure everyone understands the airway management strategy and backup plans.",
      "keyPoints": ["Document all findings systematically", "Communicate with entire team", "Ensure backup plans understood", "Note equipment requirements", "Prepare for contingencies"],
      "isCritical": false,
      "timeEstimate": 1
    }
  ],
  "299": [ // Needle Thoracentesis
    {
      "stepNumber": 1,
      "title": "Rapid Assessment and Indication Confirmation",
      "description": "Quickly assess patient for signs of tension pneumothorax: severe dyspnea, decreased breath sounds, hypotension, JVD, tracheal deviation, and chest trauma. Confirm life-threatening presentation requiring immediate decompression.",
      "keyPoints": ["Look for classic triad: dyspnea, decreased breath sounds, hypotension", "Tracheal deviation is a late sign", "JVD may be present", "Consider bilateral in trauma arrest", "Time is critical - don't delay for X-rays"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 2,
      "title": "Gather Equipment and Prepare",
      "description": "Assemble necessary equipment: 14-16 gauge needle (3.25 inch for adults, 1.25 inch for <40kg), antiseptic solution, syringe, one-way valve or flutter device, and securing materials. Don appropriate PPE.",
      "keyPoints": ["Use 14-16 gauge needle minimum", "3.25 inch length for adults", "Have antiseptic ready", "Prepare one-way valve system", "Use appropriate PPE"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 3,
      "title": "Position Patient and Identify Landmarks",
      "description": "Position patient upright if tolerated. Identify the 2nd intercostal space at the mid-clavicular line on the affected side. Locate the superior border of the 3rd rib to avoid neurovascular bundle.",
      "keyPoints": ["Upright position preferred if tolerated", "2nd ICS at mid-clavicular line", "Insert over superior border of 3rd rib", "Avoid neurovascular bundle on inferior rib border", "Palpate landmarks carefully"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 4,
      "title": "Prepare Insertion Site",
      "description": "Expose the chest and clean the insertion site thoroughly with antiseptic solution (chlorhexidine or betadine). Allow adequate contact time for antiseptic effectiveness while maintaining urgency of procedure.",
      "keyPoints": ["Expose insertion site completely", "Use appropriate antiseptic", "Allow brief contact time", "Maintain sterile technique when possible", "Balance speed with safety"],
      "isCritical": false,
      "timeEstimate": 0.5
    },
    {
      "stepNumber": 5,
      "title": "Insert Needle and Locate Rib",
      "description": "Insert the needle with attached syringe perpendicular to the chest wall at the identified location. Advance until the needle contacts the superior border of the 3rd rib while maintaining negative pressure on syringe.",
      "keyPoints": ["Insert perpendicular to chest wall", "Maintain negative pressure on syringe", "Feel for contact with rib", "Stay on superior border of rib", "Control depth carefully"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 6,
      "title": "Walk Over Rib and Enter Pleural Space",
      "description": "While maintaining needle position against rib, carefully 'walk' the needle over the superior border of the rib and advance into the pleural space. Continue negative pressure until pleural space is entered.",
      "keyPoints": ["Walk over superior rib border", "Advance slowly into pleural space", "Maintain negative pressure", "Feel for 'pop' or give-way sensation", "Listen for air rush"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 7,
      "title": "Confirm Pleural Space Entry",
      "description": "Confirm entry into pleural space by one or more signs: sudden rush of air, 'popping' sensation, ability to aspirate air into syringe, or immediate patient improvement. Note any resistance changes.",
      "keyPoints": ["Listen for air rush sound", "Feel for popping sensation", "Aspirate air into syringe", "Note immediate patient improvement", "Confirm proper placement"],
      "isCritical": true,
      "timeEstimate": 0.5
    },
    {
      "stepNumber": 8,
      "title": "Advance Catheter and Remove Needle",
      "description": "While holding the needle hub steady, advance the plastic catheter fully to the hub. Carefully remove the needle while holding the catheter in place. Never reinsert needle into catheter due to shearing risk.",
      "keyPoints": ["Hold needle hub steady", "Advance catheter to hub", "Remove needle carefully", "Never reinsert needle into catheter", "Maintain catheter position"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 9,
      "title": "Attach One-Way Valve System",
      "description": "Immediately attach the one-way valve or flutter device to the catheter hub. This allows air to escape during expiration while preventing air entry during inspiration, maintaining decompression.",
      "keyPoints": ["Attach valve immediately", "Ensure one-way function", "Allow air to escape", "Prevent air re-entry", "Check valve function"],
      "isCritical": true,
      "timeEstimate": 0.5
    },
    {
      "stepNumber": 10,
      "title": "Secure Catheter and Dressing",
      "description": "Secure the catheter in place with tape or appropriate dressing to prevent displacement. Apply sterile dressing around insertion site while ensuring the one-way valve remains functional.",
      "keyPoints": ["Secure catheter firmly", "Prevent displacement", "Apply sterile dressing", "Keep valve accessible", "Avoid kinking catheter"],
      "isCritical": false,
      "timeEstimate": 1
    },
    {
      "stepNumber": 11,
      "title": "Assess Patient Response",
      "description": "Immediately reassess patient for improvement in respiratory status, vital signs, and overall condition. Look for decreased dyspnea, improved breath sounds, stabilized blood pressure, and reduced distress.",
      "keyPoints": ["Reassess respiratory status", "Check vital signs improvement", "Listen for improved breath sounds", "Note decreased distress", "Monitor blood pressure"],
      "isCritical": true,
      "timeEstimate": 1
    },
    {
      "stepNumber": 12,
      "title": "Consider Repeat Procedure if No Improvement",
      "description": "If no improvement is noted, consider repeating the procedure on the same side or opposite side if bilateral tension pneumothorax suspected. Reassess diagnosis and consider alternative causes of patient distress.",
      "keyPoints": ["Repeat if no improvement", "Consider bilateral pneumothorax", "Reassess original diagnosis", "Look for other causes", "Don't delay other treatments"],
      "isCritical": true,
      "timeEstimate": 2
    },
    {
      "stepNumber": 13,
      "title": "Prepare for Definitive Care and Transport",
      "description": "Prepare patient for immediate transport to facility capable of definitive chest tube placement. Continue monitoring catheter function, patient status, and be prepared to repeat procedure if needed during transport.",
      "keyPoints": ["Arrange immediate transport", "Monitor catheter function", "Continue patient assessment", "Be prepared to repeat procedure", "Communicate with receiving facility"],
      "isCritical": false,
      "timeEstimate": 2
    }
  ]
};

async function main() {
  console.log('🎯 Adding comprehensive steps for priority skills...');
  
  for (const [skillId, steps] of Object.entries(skillSteps)) {
    console.log(`\n📝 Adding steps for skill ID: ${skillId}...`);
    
    // Delete existing steps first
    await prisma.skillStep.deleteMany({
      where: { skillId: parseInt(skillId) }
    });
    
    // Add new steps
    for (const step of steps) {
      await prisma.skillStep.create({
        data: {
          skillId: parseInt(skillId),
          stepNumber: step.stepNumber,
          title: step.title,
          description: step.description,
          keyPoints: step.keyPoints,
          isCritical: step.isCritical,
          timeEstimate: step.timeEstimate,
        }
      });
    }
    
    console.log(`✅ Added ${steps.length} steps for skill ID: ${skillId}`);
  }
  
  console.log('\n🎉 Successfully added comprehensive steps for all priority skills!');
  
  // Verify the additions
  console.log('\n📊 Verification:');
  for (const skillId of Object.keys(skillSteps)) {
    const stepCount = await prisma.skillStep.count({
      where: { skillId: parseInt(skillId) }
    });
    
    const skill = await prisma.skill.findUnique({
      where: { id: parseInt(skillId) },
      select: { name: true }
    });
    
    console.log(`- ${skill?.name}: ${stepCount} steps`);
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

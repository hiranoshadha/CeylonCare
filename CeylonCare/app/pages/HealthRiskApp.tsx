import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  ScrollView, SafeAreaView, StatusBar, Platform 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { RadioButton } from 'react-native-paper';

interface FormData {
  age: string;
  weight: string;
  height: string;
  bmi: string;
  gender: string;
  heartDisease: string;
  avgGlucoseLevel: string;
  bloodGlucoseLevel: string;
  hba1cLevel: string;
  smokingStatus: string;
  workType: string;
  residenceType: string;
  hypertension: string;
}

const HealthRiskApp = () => {
  const [activeTab, setActiveTab] = useState<'hypertension' | 'diabetes'>('hypertension');
  const [formData, setFormData] = useState<FormData>({
    age: '',
    weight: '',
    height: '',
    bmi: '',
    gender: '',
    heartDisease: '0',
    avgGlucoseLevel: '',
    bloodGlucoseLevel: '',
    hba1cLevel: '',
    smokingStatus: 'never smoked',
    workType: '',
    residenceType: '',
    hypertension: '0',
  });
  const [warnings, setWarnings] = useState<string[]>([]);
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    calculateBMI();
  }, [formData.height, formData.weight]);

  const calculateBMI = () => {
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    
    if (height > 0 && weight > 0) {
      const bmi = (weight / (height * height)).toFixed(2);
      setFormData(prev => ({ ...prev, bmi }));
    }
  };

  const handleInputChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newWarnings: string[] = [];
    
    if (parseFloat(formData.age) <= 0 || parseFloat(formData.age) > 120) {
      newWarnings.push("⚠ Age must be between 1 and 120.");
    }
    
    if (parseFloat(formData.weight) <= 0 || parseFloat(formData.weight) > 300) {
      newWarnings.push("⚠ Weight must be between 1 and 300 kg.");
    }
    
    if (parseFloat(formData.height) <= 0.5 || parseFloat(formData.height) > 2.5) {
      newWarnings.push("⚠ Height must be between 0.5 and 2.5 meters.");
    }
    
    if (activeTab === 'diabetes') {
      if (parseFloat(formData.bloodGlucoseLevel) < 2 || parseFloat(formData.bloodGlucoseLevel) > 30) {
        newWarnings.push("⚠ Blood Glucose Level must be between 2 and 30 mmol/L.");
      }
      
      if (parseFloat(formData.hba1cLevel) < 2 || parseFloat(formData.hba1cLevel) > 20) {
        newWarnings.push("⚠ HbA1c Level must be between 2% and 20%.");
      }
    } else {
      if (parseFloat(formData.avgGlucoseLevel) <= 20 || parseFloat(formData.avgGlucoseLevel) > 600) {
        newWarnings.push("⚠ Glucose level is medically impossible.");
      }
    }
    
    setWarnings(newWarnings);
    return newWarnings.length === 0;
  };

  const calculateHypertensionRisk = () => {
    // Simplified risk calculation logic for hypertension
    setResult("Your hypertension risk assessment has been submitted.");
  };

  const calculateDiabetesRisk = () => {
    let riskScore = 0;
    let riskLevel = "Low Risk";
    
    // Simplified diabetes risk calculation
    if (parseFloat(formData.hba1cLevel) >= 6.5) {
      riskLevel = "High Risk";
    } else if (parseFloat(formData.hba1cLevel) >= 5.7) {
      riskLevel = "Medium Risk";
    }
    
    if (parseFloat(formData.bloodGlucoseLevel) >= 7.0) {
      riskLevel = "High Risk";
    } else if (parseFloat(formData.bloodGlucoseLevel) >= 5.6) {
      riskLevel = "Medium Risk";
    }
    
    if (riskLevel === "Low Risk") {
      if (parseFloat(formData.age) > 60) riskScore++;
      if (formData.hypertension === "1") riskScore++;
      if (formData.heartDisease === "1") riskScore++;
      if (formData.smokingStatus === "formerly smoked") riskScore++;
      if (formData.smokingStatus === "smokes") riskScore += 2;
      if (parseFloat(formData.bmi) > 25) riskScore += 2;
      if (parseFloat(formData.bmi) > 30) riskScore += 3;
      
      if (riskScore >= 5) riskLevel = "High Risk";
      else if (riskScore >= 3) riskLevel = "Medium Risk";
      else if (riskScore === 0) riskLevel = "No Risk";
    }
    
    setResult(`Your Diabetes Risk Level: ${riskLevel}`);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      if (activeTab === 'hypertension') {
        calculateHypertensionRisk();
      } else {
        calculateDiabetesRisk();
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Health Risk Assessment</Text>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'hypertension' && styles.activeTab]}
            onPress={() => setActiveTab('hypertension')}
          >
            <Text style={styles.tabText}>Hypertension</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'diabetes' && styles.activeTab]}
            onPress={() => setActiveTab('diabetes')}
          >
            <Text style={styles.tabText}>Diabetes</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.formContainer}>
          {/* Common form fields */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Age (years):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={formData.age}
              onChangeText={(value) => handleInputChange('age', value)}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Weight (kg):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={formData.weight}
              onChangeText={(value) => handleInputChange('weight', value)}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Height (m):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={formData.height}
              onChangeText={(value) => handleInputChange('height', value)}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>BMI (auto-calculated):</Text>
            <TextInput
              style={[styles.input, styles.readonlyInput]}
              value={formData.bmi}
              editable={false}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Heart Disease:</Text>
            <View style={styles.radioGroup}>
              <RadioButton.Group
                value={formData.heartDisease}
                onValueChange={(value: string) => handleInputChange('heartDisease', value)}              >
                <View style={styles.radioOption}>
                  <RadioButton value="0" />
                  <Text>No</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="1" />
                  <Text>Yes</Text>
                </View>
              </RadioButton.Group>
            </View>
          </View>
          
          {/* Conditional form fields based on active tab */}
          {activeTab === 'hypertension' ? (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Average Glucose Level (mg/dL):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={formData.avgGlucoseLevel}
                  onChangeText={(value) => handleInputChange('avgGlucoseLevel', value)}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Smoking Status:</Text>
                <Picker
                  selectedValue={formData.smokingStatus}
                  onValueChange={(value: string) => handleInputChange('smokingStatus', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Smokes" value="smokes" />
                  <Picker.Item label="Formerly Smoked" value="formerly smoked" />
                  <Picker.Item label="Never Smoked" value="never smoked" />
                </Picker>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Work Type:</Text>
                <Picker
                  selectedValue={formData.workType}
                  onValueChange={(value: string) => handleInputChange('workType', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select" value="" />
                  <Picker.Item label="Private" value="Private" />
                  <Picker.Item label="Self-employed" value="Self-employed" />
                  <Picker.Item label="Government Job" value="Govt_job" />
                  <Picker.Item label="Children" value="children" />
                </Picker>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Residence Type:</Text>
                <Picker
                  selectedValue={formData.residenceType}
                  onValueChange={(value: string) => handleInputChange('residenceType', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select" value="" />
                  <Picker.Item label="Urban" value="Urban" />
                  <Picker.Item label="Rural" value="Rural" />
                </Picker>
              </View>
            </>
          ) : (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Gender:</Text>
                <View style={styles.radioGroup}>
                  <RadioButton.Group
                    value={formData.gender}
                    onValueChange={(value: string) => handleInputChange('gender', value)}
                  >
                    <View style={styles.radioOption}>
                      <RadioButton value="Male" />
                      <Text>Male</Text>
                    </View>
                    <View style={styles.radioOption}>
                      <RadioButton value="Female" />
                      <Text>Female</Text>
                    </View>
                  </RadioButton.Group>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Hypertension:</Text>
                <View style={styles.radioGroup}>
                  <RadioButton.Group
                    value={formData.hypertension}
                    onValueChange={(value: string) => handleInputChange('hypertension', value)}
                  >
                    <View style={styles.radioOption}>
                      <RadioButton value="0" />
                      <Text>No</Text>
                    </View>
                    <View style={styles.radioOption}>
                      <RadioButton value="1" />
                      <Text>Yes</Text>
                    </View>
                  </RadioButton.Group>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Blood Glucose Level (mmol/L):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={formData.bloodGlucoseLevel}
                  onChangeText={(value) => handleInputChange('bloodGlucoseLevel', value)}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>HbA1c Level (%):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={formData.hba1cLevel}
                  onChangeText={(value) => handleInputChange('hba1cLevel', value)}
                />
              </View>
            </>
          )}
          
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>
              {activeTab === 'hypertension' ? 'Check Hypertension Risk' : 'Check Diabetes Risk'}
            </Text>
          </TouchableOpacity>
          
          {warnings.length > 0 && (
            <View style={styles.warningsContainer}>
              {warnings.map((warning, index) => (
                <Text key={index} style={styles.warningText}>{warning}</Text>
              ))}
            </View>
          )}
          
          {result !== '' && (
            <Text style={styles.resultText}>{result}</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e0f7fa',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004d40',
    textAlign: 'center',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#80deea',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#00695c',
  },
  tabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: '#ffffffcc',
    borderRadius: 10,
    padding: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 5,
    padding: 8,
    fontSize: 14,
  },
  readonlyInput: {
    backgroundColor: '#f5f5f5',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 5,
  },
  radioGroup: {
    flexDirection: 'row',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  button: {
    backgroundColor: '#00695c',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  warningsContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#ffe6e6',
    borderRadius: 5,
  },
  warningText: {
    color: 'red',
    marginBottom: 5,
  },
  resultText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#e8f5e9',
    borderRadius: 5,
  }
});

export default HealthRiskApp;

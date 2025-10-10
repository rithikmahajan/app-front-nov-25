import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState, useCallback, useMemo } from "react";
import { FontFamilies, FontSizes } from "../constants";
import GlobalBackButton from "../components/GlobalBackButton";

const FONT_FAMILY = {
  BOLD: FontFamilies.bold,
  MEDIUM: FontFamilies.medium,
};
const FONT_SIZE = {
  LARGE: FontSizes.xxl,
  S: FontSizes.md,
  XS: FontSizes.sm,
};

const CustomClearance = ({ navigation }) => {
  const DOCUMENT_OPTIONS = [
    {
      label: "Upload ID as Indian Resident",
      value: "indianResident",
      documentTypes: [
        { label: "Aadhar Card", value: 1 },
        { label: "Passport Number", value: 2 },
        { label: "Election/Voter ID Card", value: 3 },
      ],
      proofOfResidence: [
        { label: "Bank Account Statement", value: 1 },
        { label: "Electricity Bill", value: 2 },
        { label: "Employee ID or HR Declaration Letter", value: 3 },
        { label: "LPG Connection - LPG Monthly Payment Receipt", value: 4 },
        { label: "Water Bill", value: 5 },
        { label: "WiFi/Broadband Bill", value: 6 },
        { label: "Telephone Bill", value: 7 },
        { label: "Property Tax/Sales Deed", value: 8 },
        { label: "Property Maintenance Bill", value: 9 },
        { label: "Government Officers - Allotment Letter", value: 10 },
        { label: "Possession Letter", value: 11 },
        { label: "PG Rent Receipt - Duly Stamped", value: 12 },
      ],
    },
    {
      label: "Upload ID as Foreign National",
      value: "foreignNational",
      documentTypes: [{ label: "Passport Number", value: 1 }],
      proofOfResidence: [
        { label: "Bank Account Statement", value: 1 },
        { label: "Electricity Bill", value: 2 },
        { label: "Employee ID or HR Declaration Letter", value: 3 },
        { label: "LPG Connection - LPG Monthly Payment Receipt", value: 4 },
        { label: "Water Bill", value: 5 },
        { label: "WiFi/Broadband Bill", value: 6 },
        { label: "Telephone Bill", value: 7 },
        { label: "Property Tax/Sales Deed", value: 8 },
        { label: "Property Maintenance Bill", value: 9 },
        { label: "Government Officers - Allotment Letter", value: 10 },
        { label: "Possession Letter", value: 11 },
        { label: "PG Rent Receipt - Duly Stamped", value: 12 },
      ],
    },
    {
      label: "Skip for Now",
      value: "skip",
      documentTypes: [],
      proofOfResidence: [],
    },
  ];
  const AddressOptions = [
    {
      label: "Address on ID Matches Shipping Address",
      value: "Same",
    },
    {
      label: "Address on ID does not Matches Shipping Address",
      value: "Different",
    },
  ];
  const FOREIGN_PROOF_DOCUMENTS = [
    "Address proof of relative/friend if staying with them",
    "Hotel Booking Receipt",
    "Rent Agreement",
    "Stay Visa",
    "Other Document",
  ];

  const [docOption, setDocOption] = useState(DOCUMENT_OPTIONS[0]);
  const [docType, setDocType] = useState({
    label: "Select Document Type",
    value: null,
  });
  const [proofOfResidence, setProofOfResidence] = useState({
    label: "Select Document Type",
    value: null,
  });
  const [addressType, setAddressType] = useState(AddressOptions[0]);
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  const [checked3, setChecked3] = useState(false);
  const [checked4, setChecked4] = useState(false);
  const [showDocTypeDropdown, setShowDocTypeDropdown] = useState(false);
  const [showProofDropdown, setShowProofDropdown] = useState(false);

  const toggleCheckbox1 = () => {
    setChecked1((prev) => !prev);
  };
  const toggleCheckbox2 = () => {
    setChecked2((prev) => !prev);
  };
  const toggleCheckbox3 = () => {
    setChecked3((prev) => !prev);
  };
  const toggleCheckbox4 = () => {
    setChecked4((prev) => !prev);
  };

  // Close dropdowns when scrolling or touching elsewhere
  const closeDropdowns = () => {
    setShowDocTypeDropdown(false);
    setShowProofDropdown(false);
  };
  return (
    <View
      style={styles.container}
    >
      {/* Back button */}
      <GlobalBackButton 
        navigation={navigation}
        style={styles.headerContainer}
        animationDuration={0}
      />

      <KeyboardAvoidingView
        style={styles.scrollContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={closeDropdowns}
        >
          {/* HEADING */}
          <View style={styles.titleContainer}>
            <Text
              style={styles.titleText}
            >
              ID for Customs Clearance
            </Text>
          </View>
          {/* sub heading */}
          <View style={styles.subtitleContainer}>
            <Text
              style={styles.subtitleText}
            >
              Provide your National ID information to expedite the customs clearance process. If you don't provide this information at Checkout, you will be asked to provide it once your order has been processed. Please ensure the address on your KYC document matches your shipping address.
            </Text>
          </View>
          {/* Choice of ids */}
          <View style={styles.optionsContainer}>
            {DOCUMENT_OPTIONS.map((option, index) => (
              <TouchableOpacity
                key={`document-option-${option.value}`}
                onPress={() => {
                  setDocType({ label: "Select Document Type", value: null });
                  setDocOption(option);
                }}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor:
                    docOption?.value === option.value ? "#000" : "#E0E0E0",
                  borderRadius: 8,
                  backgroundColor: "white",
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT_FAMILY.MEDIUM,
                    fontSize: 14,
                    color: "#000",
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/*  for indian national  */}
          {(docOption.value === "indianResident" ||
            docOption.value === "foreignNational") && (
            <View style={styles.dropdownItemContainer}>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: "#E0E0E0",
                  borderRadius: 8,
                  width: "100%",
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "white",
                }}
                onPress={() => setShowDocTypeDropdown(!showDocTypeDropdown)}
              >
                <Text
                  style={{
                    fontFamily: FONT_FAMILY.MEDIUM,
                    fontSize: 14,
                    color: docType.value ? "#000" : "#999",
                  }}
                >
                  {docType.label}
                </Text>
                <Text style={{ color: "#999", fontSize: 12 }}>▼</Text>
              </TouchableOpacity>
              
              {showDocTypeDropdown && (
                <View
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    borderWidth: 1,
                    borderColor: "#E0E0E0",
                    borderRadius: 8,
                    backgroundColor: "white",
                    marginTop: 4,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  {docOption?.documentTypes?.map((item, index) => (
                    <TouchableOpacity
                      key={`doc-type-${item.value}-${index}`}
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        borderBottomWidth: index < docOption.documentTypes.length - 1 ? 1 : 0,
                        borderBottomColor: "#f0f0f0",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                      onPress={() => {
                        setDocType(item);
                        setShowDocTypeDropdown(false);
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: FONT_FAMILY.MEDIUM,
                          fontSize: 14,
                          color: "#000",
                        }}
                      >
                        {item.label}
                      </Text>
                      {docType.value === item.value && (
                        <Text style={styles.dropdownItemCheckmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
          {/*  for adhaar card  */}
          {docOption.value === "indianResident" &&
            docType.label === "Aadhar Card" && (
              <View style={styles.marginBottom16}>
                <TextInput
                  placeholder="Adhaar number"
                  style={{
                    fontFamily: FONT_FAMILY.MEDIUM,
                    fontSize: 14,
                    borderWidth: 1,
                    borderColor: "#E0E0E0",
                    borderRadius: 8,
                    width: "100%",
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    backgroundColor: "white",
                  }}
                  placeholderTextColor={"#999"}
                  keyboardType="number-pad"
                />
              </View>
            )}
          {/*  for voter card  */}
          {docOption.value === "indianResident" &&
            docType.label === "Election/Voter ID Card" && (
              <View style={styles.marginBottom16}>
                <TextInput
                  placeholder="Voter id number"
                  style={{
                    fontFamily: FONT_FAMILY.MEDIUM,
                    fontSize: 14,
                    borderWidth: 1,
                    borderColor: "#E0E0E0",
                    borderRadius: 8,
                    width: "100%",
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    backgroundColor: "white",
                  }}
                  placeholderTextColor={"#999"}
                  keyboardType="number-pad"
                />
              </View>
            )}
          {/*  for passport number  */}
          {(docOption.value === "indianResident" ||
            docOption.value === "foreignNational") &&
            docType.label === "Passport Number" && (
              <View style={styles.marginBottom16}>
                <TextInput
                  placeholder="Passport number"
                  style={{
                    fontFamily: FONT_FAMILY.MEDIUM,
                    fontSize: 14,
                    borderWidth: 1,
                    borderColor: "#E0E0E0",
                    borderRadius: 8,
                    width: "100%",
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    backgroundColor: "white",
                  }}
                  placeholderTextColor={"#999"}
                  keyboardType="default"
                />
              </View>
            )}
          {/*  for passport expiry  */}
          {(docOption.value === "indianResident" ||
            docOption.value === "foreignNational") &&
            docType.label === "Passport Number" && (
              <View style={styles.marginBottom16}>
                <TextInput
                  placeholder="Passport Expiry Date"
                  style={{
                    fontFamily: FONT_FAMILY.MEDIUM,
                    fontSize: 14,
                    borderWidth: 1,
                    borderColor: "#E0E0E0",
                    borderRadius: 8,
                    width: "100%",
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    backgroundColor: "white",
                  }}
                  placeholderTextColor={"#999"}
                  keyboardType="default"
                />
              </View>
            )}
          {/* checkbox 1 */}
          <TouchableOpacity
            onPress={toggleCheckbox1}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 12,
              marginTop: 20,
              marginBottom: 16,
            }}
          >
            {/* Custom box */}
            <View
              style={{
                width: 16,
                height: 16,
                borderWidth: 1,
                borderColor: checked1 ? "#000" : "#E0E0E0",
                backgroundColor: checked1 ? "#000" : "transparent",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 2,
              }}
            >
              {checked1 && (
                <Text style={styles.checkmarkIcon}>✓</Text>
              )}
            </View>

            {/* Label */}
            <Text
              style={{
                fontFamily: FONT_FAMILY.MEDIUM,
                fontSize: 14,
                color: "#666",
                flex: 1,
                lineHeight: 20,
              }}
            >
              I authorise Aramex India Pvt. Ltd. and its group companies agents to act as my/our agent to Custom clear my/our shipments. Read more
            </Text>
          </TouchableOpacity>

          {/* checkbox 2 */}
          <TouchableOpacity
            onPress={toggleCheckbox2}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {/* Custom box */}
            <View
              style={{
                width: 16,
                height: 16,
                borderWidth: 1,
                borderColor: checked2 ? "#000" : "#E0E0E0",
                backgroundColor: checked2 ? "#000" : "transparent",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 2,
              }}
            >
              {checked2 && (
                <Text style={styles.checkmarkIcon}>✓</Text>
              )}
            </View>

            {/* Label */}
            <Text
              style={{
                fontFamily: FONT_FAMILY.MEDIUM,
                fontSize: 14,
                color: "#666",
                flex: 1,
                lineHeight: 20,
              }}
            >
              I have read and consent for processing my information in accordance with the Privacy Statement and Cookie Policy
            </Text>
          </TouchableOpacity>

          {/* Upload id part */}
          {/* HEADING */}
          {docOption.value === "indianResident" && (
            <View style={[styles.marginTop32, styles.marginBottom12]}>
              <Text
                style={{
                  fontFamily: FONT_FAMILY.BOLD,
                  fontSize: 20,
                  color: "#000",
                  lineHeight: 24,
                }}
              >
                Upload Passport
              </Text>
            </View>
          )}
          {/* sub heading */}
          {docOption.value === "indianResident" && (
            <View style={styles.marginBottom24}>
              <Text
                style={{
                  fontFamily: FONT_FAMILY.MEDIUM,
                  fontSize: 14,
                  color: "#666",
                  lineHeight: 20,
                }}
              >
                Be sure that your name, photograph, and ID number are clearly visible in the ID photograph, or it may be rejected at customs, causing delivery delays.
              </Text>
            </View>
          )}
          {/* front side  */}
          {docOption.value === "indianResident" && (
            <View style={styles.marginBottom16}>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: "#E0E0E0",
                  borderRadius: 8,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "white",
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT_FAMILY.MEDIUM,
                    fontSize: 14,
                    color: "#666",
                  }}
                >
                  Upload front side
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  fontFamily: FONT_FAMILY.MEDIUM,
                  fontSize: 12,
                  color: "#999",
                  marginTop: 4,
                }}
              >
                Only .jpg and .jpeg files are allowed.
              </Text>
            </View>
          )}
          {/* back side */}
          {docOption.value === "indianResident" && (
            <View style={styles.marginBottom32}>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: "#E0E0E0",
                  borderRadius: 8,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "white",
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT_FAMILY.MEDIUM,
                    fontSize: 14,
                    color: "#666",
                  }}
                >
                  Upload reverse side
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  fontFamily: FONT_FAMILY.MEDIUM,
                  fontSize: 12,
                  color: "#999",
                  marginTop: 4,
                }}
              >
                Only .jpg and .jpeg files are allowed.
              </Text>
            </View>
          )}

          {/*  for foreign residents */}
          {docOption.value === "foreignNational" && (
            <View style={styles.paddingTop10}>
              <Text
                style={{
                  fontFamily: FONT_FAMILY.BOLD,
                  fontSize: FONT_SIZE.LARGE,
                }}
              >
                Upload Passport
              </Text>
            </View>
          )}
          {/* sub heading */}
          {docOption.value === "foreignNational" && (
            <View style={styles.rowDirectionWrap}>
              <Text
                style={{
                  fontFamily: FONT_FAMILY.BOLD,
                  fontSize: FONT_SIZE.S,
                  color: "gray",
                }}
              >
                Be sure that your name, photograph, and ID number are clearly
                visible in the ID photograph, or it may be rejected at customs,
                causing delivery delays.
              </Text>
            </View>
          )}
          {/* front side  */}
          {docOption.value === "foreignNational" && (
            <View style={styles.gapTwo}>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: "lightgray",
                  borderRadius: 12,
                  alignSelf: "flex-start",
                  padding: 5,
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT_FAMILY.BOLD,
                    fontSize: FONT_SIZE.S,
                    color: "darkgray",

                    flexWrap: "wrap",
                    paddingLeft: 5,
                  }}
                >
                  Upload front side
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  fontFamily: FONT_FAMILY.BOLD,
                  fontSize: FONT_SIZE.XS,
                  color: "darkgray",
                }}
              >
                Only .jpg and .jpeg files are allowed.
              </Text>
            </View>
          )}
          {/* back side */}
          {docOption.value === "foreignNational" && (
            <View style={styles.gapTwo}>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: "lightgray",
                  borderRadius: 12,
                  alignSelf: "flex-start",
                  padding: 5,
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT_FAMILY.BOLD,
                    fontSize: FONT_SIZE.S,
                    color: "darkgray",

                    flexWrap: "wrap",
                    paddingLeft: 5,
                  }}
                >
                  Upload reverse side
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  fontFamily: FONT_FAMILY.BOLD,
                  fontSize: FONT_SIZE.XS,
                  color: "darkgray",
                }}
              >
                Only .jpg and .jpeg files are allowed.
              </Text>
            </View>
          )}
          {/*  visa / pio  */}
          {docOption.value === "foreignNational" && (
            <View style={styles.paddingTop10}>
              <Text
                style={{
                  fontFamily: FONT_FAMILY.BOLD,
                  fontSize: FONT_SIZE.LARGE,
                }}
              >
                Upload Visa / PIO
              </Text>
            </View>
          )}
          {/*  for passport number  */}
          {docOption.value === "foreignNational" && (
            <TextInput
              placeholder="Document number"
              style={{
                fontFamily: FONT_FAMILY.MEDIUM,
                fontSize: 14,
                borderWidth: 1,
                borderColor: "#E0E0E0",
                borderRadius: 8,
                width: "100%",
                paddingVertical: 14,
                paddingHorizontal: 16,
                backgroundColor: "white",
              }}
              placeholderTextColor={"#999"}
              keyboardType="number-pad"
            />
          )}
          {/* visa / pio upload side  */}
          {docOption.value === "foreignNational" && (
            <View style={styles.gapTwo}>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: "lightgray",
                  borderRadius: 12,
                  alignSelf: "flex-start",
                  padding: 5,
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT_FAMILY.BOLD,
                    fontSize: FONT_SIZE.S,
                    color: "darkgray",

                    flexWrap: "wrap",
                    paddingLeft: 5,
                  }}
                >
                  Upload Visa / PIO
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  fontFamily: FONT_FAMILY.BOLD,
                  fontSize: FONT_SIZE.XS,
                  color: "darkgray",
                }}
              >
                Only .jpg and .jpeg files are allowed.
              </Text>
            </View>
          )}
          {/* Address options heading */}
          <View style={[styles.marginTop32, styles.marginBottom12]}>
            <Text
              style={{
                fontFamily: FONT_FAMILY.BOLD,
                fontSize: 16,
                color: "#000",
                lineHeight: 20,
              }}
            >
              Address on ID Matches Shipping Address
            </Text>
          </View>

          {/* Choice of address matching */}
          <View style={{ gap: 12, marginBottom: 32 }}>
            {AddressOptions.map((option, index) => (
              <TouchableOpacity
                key={`address-option-${option.value}`}
                onPress={() => {
                  setAddressType(option);
                }}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor:
                    addressType?.value === option.value ? "#000" : "#E0E0E0",
                  borderRadius: 8,
                  backgroundColor: "white",
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT_FAMILY.MEDIUM,
                    fontSize: 14,
                    color: "#000",
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/*  proof of residence */}
          {docOption.value === "foreignNational" && (
            <View style={[styles.marginTop32, styles.marginBottom12]}>
              <Text
                style={{
                  fontFamily: FONT_FAMILY.BOLD,
                  fontSize: 20,
                  color: "#000",
                  lineHeight: 24,
                }}
              >
                Upload Proof of residence
              </Text>
            </View>
          )}
          {/* sub heading */}
          {docOption.value === "foreignNational" && (
            <View
              style={{ flexDirection: "row", flexWrap: "wrap", paddingTop: 10 }}
            >
              <Text
                style={{
                  fontFamily: FONT_FAMILY.BOLD,
                  fontSize: FONT_SIZE.S,
                  color: "gray",
                  flexWrap: "wrap",
                  flex: 1,
                }}
              >
                Be sure that the address on the document matches the delivery
                address you have submitted above. To see list of acceptable
                documents{" "}
                <Text
                  onPress={() => {
                    // handle link press here
                  }}
                  style={{
                    color: "black",
                    textDecorationLine: "underline",
                  }}
                >
                  click here
                </Text>
                .
              </Text>
            </View>
          )}

          {/*  for foreign national  proof of residence */}
          {docOption.value === "foreignNational" && (
            <View style={{ position: 'relative', zIndex: 50 }}>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: "#E0E0E0",
                  borderRadius: 8,
                  width: "100%",
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "white",
                }}
                onPress={() => setShowProofDropdown(!showProofDropdown)}
              >
                <Text
                  style={{
                    fontFamily: FONT_FAMILY.MEDIUM,
                    fontSize: 14,
                    color: proofOfResidence.value ? "#000" : "#999",
                  }}
                >
                  {proofOfResidence.label}
                </Text>
                <Text style={{ color: "#999", fontSize: 12 }}>▼</Text>
              </TouchableOpacity>
              
              {showProofDropdown && (
                <View
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    borderWidth: 1,
                    borderColor: "#E0E0E0",
                    borderRadius: 8,
                    backgroundColor: "white",
                    marginTop: 4,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  {docOption?.proofOfResidence?.map((item, index) => (
                    <TouchableOpacity
                      key={`proof-residence-${item.value}-${index}`}
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        borderBottomWidth: index < docOption.proofOfResidence.length - 1 ? 1 : 0,
                        borderBottomColor: "#f0f0f0",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                      onPress={() => {
                        setProofOfResidence(item);
                        setShowProofDropdown(false);
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: FONT_FAMILY.MEDIUM,
                          fontSize: 14,
                          color: "#000",
                        }}
                      >
                        {item.label}
                      </Text>
                      {proofOfResidence.value === item.value && (
                        <Text style={{ color: "#000", fontSize: 16, fontWeight: "bold" }}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* proof of address upload */}

          {/*  for proof of residence dcoument number  */}
          {docOption.value === "foreignNational" && (
            <TextInput
              placeholder="Document number"
              style={{
                fontFamily: FONT_FAMILY.MEDIUM,
                fontSize: 14,
                borderWidth: 1,
                borderColor: "#E0E0E0",
                borderRadius: 8,
                width: "100%",
                paddingVertical: 14,
                paddingHorizontal: 16,
                backgroundColor: "white",
              }}
              placeholderTextColor={"#999"}
              keyboardType="number-pad"
            />
          )}
          {/* visa / pio upload side  */}
          {docOption.value === "foreignNational" && (
            <View style={{ gap: 2, paddingBottom: 10 }}>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: "lightgray",
                  borderRadius: 12,
                  alignSelf: "flex-start",
                  padding: 5,
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT_FAMILY.BOLD,
                    fontSize: FONT_SIZE.S,
                    color: "darkgray",

                    flexWrap: "wrap",
                    paddingLeft: 5,
                  }}
                >
                  Upload Proof of residence
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  fontFamily: FONT_FAMILY.BOLD,
                  fontSize: FONT_SIZE.XS,
                  color: "darkgray",
                }}
              >
                Only .jpg and .jpeg files are allowed.
              </Text>
            </View>
          )}

          {/*  alert for proof of residence */}
          {/* sub heading */}
          {docOption.value === "foreignNational" && (
            <View style={styles.rowDirectionWrap}>
              <Text
                style={{
                  fontFamily: FONT_FAMILY.BOLD,
                  fontSize: FONT_SIZE.S,
                  color: "gray",
                }}
              >
                ID required for customs We will need your ID information before
                shipping your order. Delay in providing ID will impact your
                delivery date.
              </Text>
            </View>
          )}
          {/* checkbox 4 */}
          {docOption.value === "foreignNational" && (
            <TouchableOpacity
              onPress={toggleCheckbox4}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderWidth: 1,
                  borderColor: checked4 ? "black" : "#ccc",
                  backgroundColor: checked4 ? "black" : "transparent",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 2,
                }}
              >
                {checked4 && (
                  <Text style={styles.checkmarkIcon}>✓</Text>
                )}
              </View>

              <Text
                style={{
                  fontFamily: FONT_FAMILY.MEDIUM,
                  fontSize: FONT_SIZE.XS,
                  color: "#666",
                  flex: 1,
                  lineHeight: 18,
                }}
              >
                I have read and consent for processing my information in
                accordance with the Privacy Statement and Cookie Policy.
              </Text>
            </TouchableOpacity>
          )}

          {/*  Address proof info  */}
          {/* proof of residence */}
          {docOption.value === "foreignNational" && (
            <View style={styles.paddingTop10}>
              <Text
                style={{
                  fontFamily: FONT_FAMILY.BOLD,
                  fontSize: FONT_SIZE.LARGE,
                }}
              >
                Address Proof
              </Text>
            </View>
          )}

          {docOption.value === "foreignNational" && (
            <View style={{ gap: 5 }}>
              <Text
                style={{
                  fontFamily: FONT_FAMILY.BOLD,
                  fontSize: FONT_SIZE.S,
                  color: "gray",
                }}
              >
                Please provide any ONE of the following address proof document.
                The address on this document should match with the delivery
                address.
              </Text>

              {/* Mapped document list */}
              {FOREIGN_PROOF_DOCUMENTS.map((item, index) => (
                <Text
                  key={`foreign-proof-doc-${index}`}
                  style={{
                    fontFamily: FONT_FAMILY.MEDIUM,
                    fontSize: FONT_SIZE.XS,
                    color: "gray",
                    marginLeft: 0,
                  }}
                >
                  {`${String.fromCharCode(97 + index)}. ${item}`}
                </Text>
              ))}
            </View>
          )}

          {/* checkbox 3*/}
          <TouchableOpacity
            onPress={toggleCheckbox3}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            {/* Custom box */}
            <View
              style={{
                width: 16,
                height: 16,
                borderWidth: 1,
                borderColor: checked3 ? "black" : "#ccc",
                backgroundColor: checked3 ? "black" : "transparent",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 2,
              }}
            >
              {checked3 && (
                <Text style={styles.checkmarkIcon}>✓</Text>
              )}
            </View>

            {/* Label */}
            <Text
              style={{
                fontFamily: FONT_FAMILY.MEDIUM,
                fontSize: FONT_SIZE.XS,
                color: "black",
                flex: 1,
                lineHeight: 18,
              }}
            >
              Billing matches shipping address
            </Text>
          </TouchableOpacity>

          {/* Place Order Button */}
          <TouchableOpacity
            style={{
              backgroundColor: "#000",
              borderRadius: 8,
              paddingVertical: 16,
              marginTop: 40,
              marginBottom: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => navigation.navigate('OrderConfirmationPhone')}
          >
            <Text
              style={{
                fontFamily: FONT_FAMILY.BOLD,
                fontSize: 16,
                color: "white",
                textAlign: "center",
              }}
            >
              Place Order
            </Text>
          </TouchableOpacity>
          
          <View style={styles.spacerBottom} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// Optimized styles to replace inline styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: "15%",
    paddingHorizontal: 16,
  },
  headerContainer: {
    marginBottom: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    gap: 16,
  },
  titleContainer: {
    marginBottom: 12,
  },
  titleText: {
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: 20,
    color: "black",
    lineHeight: 24,
  },
  subtitleContainer: {
    marginBottom: 24,
  },
  subtitleText: {
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "white",
  },
  optionButtonSelected: {
    borderColor: "#000",
  },
  optionButtonUnselected: {
    borderColor: "#E0E0E0",
  },
  optionText: {
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: 14,
    color: "#000",
  },
  dropdownContainer: {
    marginBottom: 16,
    position: 'relative',
    zIndex: 100,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  dropdownText: {
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: 14,
  },
  dropdownTextSelected: {
    color: "#000",
  },
  dropdownTextPlaceholder: {
    color: "#999",
  },
  dropdownArrow: {
    color: "#999",
    fontSize: 12,
  },
  spacerBottom: {
    height: 50,
  },
  marginBottom12: {
    marginBottom: 12,
  },
  marginBottom16: {
    marginBottom: 16,
  },
  marginBottom24: {
    marginBottom: 24,
  },
  marginBottom32: {
    marginBottom: 32,
  },
  marginTop32: {
    marginTop: 32,
  },
  paddingTop10: {
    paddingTop: 10,
  },
  rowDirection: {
    flexDirection: 'row',
  },
  rowDirectionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  flexOne: {
    flex: 1,
  },
  gapTwo: {
    gap: 2,
  },
  gapTen: {
    gap: 10,
  },
  centerAlignStart: {
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  uploadButtonBorder: {
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 12,
    alignSelf: 'flex-start',
    padding: 5,
  },
  uploadButtonText: {
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: FONT_SIZE.S,
    color: 'darkgray',
    flexWrap: 'wrap',
    paddingLeft: 5,
  },
  fileFormatText: {
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: FONT_SIZE.XS,
    color: 'darkgray',
  },
  checkmarkIcon: {
    fontSize: 10,
    color: 'white',
  },
  dropdownItemCheckmark: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownItemContainer: {
    marginBottom: 16,
    position: 'relative',
    zIndex: 100,
  },
});

export default React.memo(CustomClearance);

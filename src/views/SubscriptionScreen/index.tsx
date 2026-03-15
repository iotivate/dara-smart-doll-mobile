/* eslint-disable no-catch-shadow */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '@components/CustomHeader';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import CustomButton from '@components/CustomButton';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import PaymentStatusModal from '@components/PaymentStatusModal';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';

interface PlanFeature {
  noOfChildren: number;
  ai: boolean;
}

interface Plan {
  _id: string;
  name: string;
  description: string;
  language: string;
  featureHighlights: string[];
  features: PlanFeature;
  price: number;
  billingCycle?: string;
  isPlanPurchased?: boolean;
  isExpired?: boolean;
}

interface SubscriptionPlan {
  plans: Plan[];
  billingCycle: string;
}

type TabType = 'all' | 'free' | 'monthly' | 'yearly';

const SubscriptionScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const languageData = useSelector(
    (state: any) => state?.language?.languageData,
  );

  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<
    'success' | 'failed' | 'pending'
  >('success');
  const [modalVisible, setModalVisible] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const paymentTimerRef = useRef<any>(null);
  const paymentAttemptRef = useRef(0);

  // Fetch subscription plans on component mount
  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (paymentTimerRef.current) {
          clearInterval(paymentTimerRef.current);
          paymentTimerRef.current = null;
        }
        paymentAttemptRef.current = 0;
        setIsProcessingPayment(false);
        setProcessingPlanId(null);
      };
    }, []),
  );

  // Process plans when subscriptionPlans changes
  useEffect(() => {
    if (subscriptionPlans.length > 0) {
      processPlans();
    }
  }, [subscriptionPlans]);

  // Filter plans when activeTab changes
  useEffect(() => {
    filterPlansByTab();
  }, [activeTab, allPlans]);

  // API call to fetch subscription plans
  const fetchSubscriptionPlans = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest(ApiURL.subscribtion, 'GET', null, true);

      if (!response.error && response.data) {
        setSubscriptionPlans(response.data);

        // Auto-select the first plan if available
        if (response.data.length > 0) {
          const firstPaidPlan = response.data
            .flatMap((item: SubscriptionPlan) => item.plans)
            .find((plan: Plan) => plan.price > 0);

          if (firstPaidPlan) {
            setSelectedPlan(firstPaidPlan._id);
          } else if (response.data[0].plans.length > 0) {
            setSelectedPlan(response.data[0].plans[0]._id);
          }
        }
      } else {
        setError(response.message || 'Failed to fetch subscription plans');
      }
    } catch (error: any) {
      console.log('Error fetching subscription plans:', error);
      setError(error.message || 'Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const startFlutterwavePaymentVerification = (
    paymentReference: string,
    maxAttempts = 20,
    intervalTime = 10000,
  ) => {
    console.log('Starting payment verification for:', paymentReference);

    // prevent multiple intervals
    if (paymentTimerRef.current) return;

    paymentAttemptRef.current = 0;

    paymentTimerRef.current = setInterval(async () => {
      paymentAttemptRef.current += 1;

      try {
        const res: any = await apiRequest(
          `${ApiURL.status}?transactionId=${paymentReference}`,
          'GET',
          null,
          true,
        );

        console.log('Verification attempt:', paymentAttemptRef.current, res);

        const status = res?.data?.status;

        // ✅ SUCCESS
        if (!res?.error && status === 'success') {
          if (paymentTimerRef.current) {
            clearInterval(paymentTimerRef.current);
            paymentTimerRef.current = null;
          }
          setPaymentStatus('success');
          setModalVisible(true);
          setIsProcessingPayment(false);
          setProcessingPlanId(null);
          return;
        }

        // ⏳ PENDING
        if (!res?.error && status === 'pending') {
          console.log('Payment still pending...');
          // wait for next interval
          setPaymentStatus('pending');
          setModalVisible(true);
        }

        // ❌ FAILED
        if (
          res?.error ||
          status === 'failed' ||
          paymentAttemptRef.current >= maxAttempts
        ) {
          if (paymentTimerRef.current) {
            clearInterval(paymentTimerRef.current);
            paymentTimerRef.current = null;
          }
          setPaymentStatus('failed');
          setModalVisible(true);
          setIsProcessingPayment(false);
          setProcessingPlanId(null);
          return;
        }
      } catch (error) {
        console.log('Payment verify error', error);
        if (paymentTimerRef.current) {
          clearInterval(paymentTimerRef.current);
          paymentTimerRef.current = null;
        }
        setPaymentStatus('failed');
        setModalVisible(true);
        setIsProcessingPayment(false);
        setProcessingPlanId(null);
        return;
      }
    }, intervalTime);
  };

  // Process plans from subscription data
  const processPlans = () => {
    const plansList: Plan[] = [];

    subscriptionPlans.forEach((subscription: SubscriptionPlan) => {
      const plansWithCycle = subscription.plans.map(plan => ({
        ...plan,
        billingCycle: subscription.billingCycle,
      }));
      plansList.push(...plansWithCycle);
    });

    setAllPlans(plansList);
  };

  // Filter plans based on active tab
  const filterPlansByTab = () => {
    if (activeTab === 'all') {
      setFilteredPlans(allPlans);
    } else {
      const filtered = allPlans.filter(
        plan => plan.billingCycle?.toLowerCase() === activeTab.toLowerCase(),
      );
      setFilteredPlans(filtered);
    }
  };

  // Handle tab selection
  const handleTabSelect = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Handle plan selection
  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  // Handle subscription button press - NEW RENEW FLOW
  const handleSubscribe = async (plan: Plan) => {
    console.log('Selected plan:', plan);

    // Check if plan is already purchased
    if (plan.isPlanPurchased) {
      // Call renew API
      await handleRenewPlan(plan._id);
    } else {
      // Call purchase API for new subscription
      await handlePurchasePlan(plan._id);
    }
  };

  // Handle purchase for new subscription
  const handlePurchasePlan = async (planId: string) => {
    setIsProcessingPayment(true);
    setProcessingPlanId(planId);

    const payload = {
      subscriptionPlanId: planId,
    };

    try {
      const res: any = await apiRequest(ApiURL.purchase, 'POST', payload, true);
      console.log('Purchase response:', res);

      // ✅ Success check
      if (!res?.error && res?.data) {
        const { paymentMode, paymentLink, transactionId } = res.data;

        // ✅ Flutterwave flow
        if (paymentMode === 'flutterwave' && paymentLink) {
          Linking.openURL(paymentLink);

          setPaymentStatus('pending');
          setModalVisible(true);

          startFlutterwavePaymentVerification(transactionId);
        } else {
          // Handle other payment modes or direct success
          setPaymentStatus('success');
          setModalVisible(true);
          setIsProcessingPayment(false);
          setProcessingPlanId(null);
        }
      } else {
        console.warn('Purchase failed:', res?.message);
        Alert.alert('Error', res?.message || 'Purchase failed');
        setIsProcessingPayment(false);
        setProcessingPlanId(null);
      }
    } catch (error: any) {
      console.log('Purchase error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setIsProcessingPayment(false);
      setProcessingPlanId(null);
    }
  };

  // Handle renew for existing subscription
  const handleRenewPlan = async (_id?: string) => {
    setIsProcessingPayment(true);
    // setProcessingPlanId();

    try {
      const res: any = await apiRequest(ApiURL.renew, 'POST', {}, true);
      console.log('Renew response:', res);

      // ✅ Success check
      if (!res?.error && res?.data) {
        const { paymentMode, paymentLink, transactionId } = res.data;

        // ✅ Flutterwave flow
        if (paymentMode === 'flutterwave' && paymentLink) {
          Linking.openURL(paymentLink);

          setPaymentStatus('pending');
          setModalVisible(true);

          startFlutterwavePaymentVerification(transactionId);
        } else {
          // Handle other payment modes or direct success
          setPaymentStatus('success');
          setModalVisible(true);
          setIsProcessingPayment(false);
          setProcessingPlanId(null);
        }
      } else {
        console.warn('Renew failed:', res?.message);
        Alert.alert('Error', res?.message || 'Renew failed');
        setIsProcessingPayment(false);
        setProcessingPlanId(null);
      }
    } catch (error: any) {
      console.log('Renew error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setIsProcessingPayment(false);
      setProcessingPlanId(null);
    }
  };

  // Get button text based on plan status
  const getButtonText = (plan: Plan) => {
    if (plan.price === 0) return languageData?.get_started || 'Get Started';

    if (plan.isPlanPurchased) return languageData?.renew || 'Renew';

    return languageData?.subscribe_now || 'Subscribe Now';
  };

  // Get button loading state
  const isButtonLoading = (plan: Plan) => {
    return isProcessingPayment && processingPlanId === plan._id;
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalVisible(false);

    // Refresh plans after payment success/failure
    if (paymentStatus === 'success' || paymentStatus === 'failed') {
      fetchSubscriptionPlans();
    }
  };

  // Format price based on billing cycle
  const formatPrice = (plan: Plan) => {
    if (plan.price === 0) return languageData?.free || 'FREE';

    const price = `$${plan.price}`;

    switch (plan.billingCycle) {
      case 'monthly':
        return `${price}/month`;
      case 'yearly':
        return `${price}/year`;
      case 'free':
        return languageData?.free || 'FREE';
      default:
        return price;
    }
  };

  // Get billing cycle display name
  // const getBillingCycleDisplay = (cycle: string) => {
  //   switch (cycle?.toLowerCase()) {
  //     case 'monthly':
  //       return 'Monthly';
  //     case 'yearly':
  //       return 'Yearly';
  //     case 'free':
  //       return 'Free';
  //     default:
  //       return cycle || 'N/A';
  //   }
  // };

  const getBillingCycleDisplay = (cycle: string) => {
    switch (cycle?.toLowerCase()) {
      case 'monthly':
        return languageData?.monthly || 'Monthly';
      case 'yearly':
        return languageData?.yearly || 'Yearly';
      case 'free':
        return languageData?.free || 'Free';
      default:
        return cycle || languageData?.not_available || 'N/A';
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <StatusBar
          backgroundColor={theme.themeColor}
          barStyle={'light-content'}
        />
        <CustomHeader
          showBackButton={true}
          showNotifications={false}
          backButtonText={languageData?.subscription || 'Subscription'}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.themeColor} />
          <Text style={styles.loadingText}>
            {languageData?.loading_plans || 'Loading plans...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        marginTop: moderateScale(20),
      }}
    >
      <StatusBar
        backgroundColor={theme.themeColor}
        barStyle={'light-content'}
      />

      <CustomHeader
        showBackButton={true}
        showNotifications={false}
        backButtonText={
          languageData?.subscription_and_premium || 'Subscription & Premium'
        }
      />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.choosePlanText}>
          {languageData?.choose_plan || 'Choose Plan'}
        </Text>

        {/* Tabs Header */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'all' && styles.activeTabButton,
            ]}
            onPress={() => handleTabSelect('all')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'all' && styles.activeTabText,
              ]}
            >
              {languageData?.all || 'All'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'free' && styles.activeTabButton,
            ]}
            onPress={() => handleTabSelect('free')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'free' && styles.activeTabText,
              ]}
            >
              {languageData?.free || 'Free'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'monthly' && styles.activeTabButton,
            ]}
            onPress={() => handleTabSelect('monthly')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'monthly' && styles.activeTabText,
              ]}
            >
              {languageData?.monthly || 'Monthly'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'yearly' && styles.activeTabButton,
            ]}
            onPress={() => handleTabSelect('yearly')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'yearly' && styles.activeTabText,
              ]}
            >
              {languageData?.yearly || 'Yearly'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Plans List */}
        {filteredPlans.length > 0 ? (
          filteredPlans.map(plan => (
            <TouchableOpacity
              key={plan._id}
              activeOpacity={0.9}
              onPress={() => handlePlanSelect(plan._id)}
              style={[
                styles.planCard,
                {
                  borderColor:
                    selectedPlan === plan._id
                      ? theme.themeColor
                      : theme.borderColorDynamic,
                  borderWidth: selectedPlan === plan._id ? 2 : 1,
                  backgroundColor:
                    selectedPlan === plan._id
                      ? theme.themeColor + '10' // 10% opacity of theme color
                      : theme.boxBackground,
                },
              ]}
            >
              {/* Plan Header with Price Badge */}
              <View style={styles.planHeader}>
                <View style={styles.planInfo}>
                  <View style={styles.planTitleRow}>
                    <Text
                      style={[
                        styles.planTitle,
                        selectedPlan === plan._id && styles.selectedPlanTitle,
                      ]}
                    >
                      {plan.name}
                    </Text>

                    {/* Show purchased badge if plan is already purchased */}
                    {plan.isPlanPurchased && (
                      <View style={styles.purchasedBadge}>
                        <Text style={styles.purchasedBadgeText}>
                          {languageData?.purchased || 'Purchased'}
                        </Text>
                      </View>
                    )}

                    <View
                      style={[
                        styles.billingCycleBadge,
                        plan.billingCycle === 'free' && styles.freeBadge,
                        plan.billingCycle === 'monthly' && styles.monthlyBadge,
                        plan.billingCycle === 'yearly' && styles.yearlyBadge,
                      ]}
                    >
                      <Text style={styles.billingCycleBadgeText}>
                        {getBillingCycleDisplay(plan.billingCycle || '')}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.planDescription,
                      selectedPlan === plan._id &&
                        styles.selectedPlanDescription,
                    ]}
                  >
                    {plan.description}
                  </Text>
                </View>

                {/* Price Display */}
                <View style={styles.priceContainer}>
                  <Text
                    style={[
                      styles.priceText,
                      selectedPlan === plan._id && styles.selectedPriceText,
                      plan.price === 0 && styles.freePriceText,
                    ]}
                  >
                    {formatPrice(plan)}
                  </Text>
                </View>
              </View>

              {/* Feature Highlights */}
              <View style={styles.planFeatures}>
                {plan.featureHighlights.map((feature, featureIndex) => (
                  <View key={featureIndex} style={styles.featureItemContainer}>
                    <View style={styles.featureIconContainer}>
                      <Text
                        style={[
                          styles.featureIcon,
                          selectedPlan === plan._id &&
                            styles.selectedFeatureIcon,
                        ]}
                      >
                        ✓
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.featureItem,
                        selectedPlan === plan._id && styles.selectedFeatureItem,
                      ]}
                    >
                      {feature}
                    </Text>
                  </View>
                ))}

                {/* Additional features from features object */}
                <View style={styles.featureItemContainer}>
                  <View style={styles.featureIconContainer}>
                    <Text
                      style={[
                        styles.featureIcon,
                        selectedPlan === plan._id && styles.selectedFeatureIcon,
                      ]}
                    >
                      ✓
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.featureItem,
                      selectedPlan === plan._id && styles.selectedFeatureItem,
                    ]}
                  >
                    {plan.features.noOfChildren} child
                    {plan.features.noOfChildren !== 1 ? 'ren' : ''}
                  </Text>
                </View>

                <View style={styles.featureItemContainer}>
                  <View style={styles.featureIconContainer}>
                    <Text
                      style={[
                        styles.featureIcon,
                        selectedPlan === plan._id && styles.selectedFeatureIcon,
                      ]}
                    >
                      {plan.features.ai ? '✓' : '✗'}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.featureItem,
                      selectedPlan === plan._id && styles.selectedFeatureItem,
                    ]}
                  >
                    {languageData?.ai_features || 'AI Features'}:{' '}
                    {plan.features.ai
                      ? languageData?.enabled || 'Enabled'
                      : languageData?.disabled || 'Disabled'}
                  </Text>
                </View>
              </View>

              {/* Action Button */}
              <CustomButton
                text={getButtonText(plan)}
                backgroundColor={
                  selectedPlan === plan._id
                    ? theme.themeColor
                    : plan.price === 0
                    ? theme.success || '#10B981'
                    : theme.boxBackground
                }
                textColor={
                  selectedPlan === plan._id || plan.price === 0
                    ? theme.white
                    : theme.text
                }
                height={moderateScale(45)}
                fontSize={moderateScale(14)}
                style={styles.subscribeBtn}
                onPress={() => handleSubscribe(plan)}
                isLoading={isButtonLoading(plan)}
                disabled={isButtonLoading(plan)}
              />

              {/* Radio Circle for selection */}
              <View
                style={[
                  styles.radioCircle,
                  {
                    borderColor:
                      selectedPlan === plan._id
                        ? theme.themeColor
                        : theme.borderColorDynamic,
                  },
                ]}
              >
                {selectedPlan === plan._id && (
                  <View
                    style={[
                      styles.radioDot,
                      { backgroundColor: theme.themeColor },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noPlansContainer}>
            <Text style={styles.noPlansText}>
              {languageData?.no_plans_available?.replace(
                '{{type}}',
                activeTab === 'all'
                  ? ''
                  : languageData?.[activeTab] || activeTab,
              ) ||
                `No ${activeTab === 'all' ? '' : activeTab} plans available.`}
            </Text>
          </View>
        )}

        {/* Footer Info */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            •{' '}
            {languageData?.footer_basic_access ||
              'All plans include access to basic features'}
          </Text>
          <Text style={styles.footerText}>
            •{' '}
            {languageData?.footer_upgrade_anytime ||
              'Upgrade or cancel anytime'}
          </Text>
          <Text style={styles.footerText}>
            •{' '}
            {languageData?.footer_money_back ||
              '30-day money-back guarantee for paid plans'}
          </Text>
        </View>
      </ScrollView>

      {/* Payment Status Modal */}
      <PaymentStatusModal
        visible={modalVisible}
        type={paymentStatus}
        title={
          paymentStatus === 'success'
            ? languageData?.payment_successful || 'Payment Successful'
            : paymentStatus === 'failed'
            ? languageData?.payment_failed || 'Payment Failed'
            : paymentStatus === 'pending'
            ? languageData?.payment_processing || 'Payment Processing'
            : ''
        }
        message={
          paymentStatus === 'success'
            ? languageData?.payment_success_message ||
              'Your subscription has been processed successfully.'
            : paymentStatus === 'failed'
            ? languageData?.payment_failed_message ||
              'Something went wrong. Please try again.'
            : paymentStatus === 'pending'
            ? languageData?.payment_pending_message ||
              'Payment is processing. Please wait.'
            : ''
        }
        onClose={handleModalClose}
      />
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: moderateScale(20),
      paddingBottom: moderateScale(30),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: moderateScale(20),
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.text,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: moderateScale(20),
    },
    errorText: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.themeRed,
      textAlign: 'center',
      marginBottom: moderateScale(20),
    },
    retryButton: {
      width: '50%',
      borderRadius: moderateScale(10),
    },
    choosePlanText: {
      fontSize: moderateScale(20),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      marginTop: moderateScale(20),
      marginBottom: moderateScale(15),
      textAlign: 'center',
    },

    // Tabs Styles
    tabsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: moderateScale(25),
      backgroundColor: theme.boxBackground,
      borderRadius: moderateScale(10),
      padding: moderateScale(4),
    },
    tabButton: {
      flex: 1,
      paddingVertical: moderateScale(10),
      alignItems: 'center',
      borderRadius: moderateScale(8),
    },
    activeTabButton: {
      backgroundColor: theme.background,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    tabText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.textSub,
    },
    activeTabText: {
      color: theme.text,
    },

    // Plan Card Styles
    planCard: {
      backgroundColor: theme.boxBackground,
      borderRadius: moderateScale(12),
      padding: moderateScale(20),
      marginBottom: moderateScale(15),
      position: 'relative',
      shadowColor: theme.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    planHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: moderateScale(15),
      marginTop: moderateScale(20),
    },
    planInfo: {
      flex: 1,
      marginRight: moderateScale(10),
    },
    planTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: moderateScale(5),
      flexWrap: 'wrap',
      gap: moderateScale(8),
    },
    planTitle: {
      fontSize: moderateScale(15),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      marginRight: moderateScale(10),
    },
    selectedPlanTitle: {
      color: theme.themeColor,
    },
    planDescription: {
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.textSub,
      lineHeight: moderateScale(18),
    },
    selectedPlanDescription: {
      color: theme.themeColor + 'CC',
    },

    // Purchased Badge
    purchasedBadge: {
      backgroundColor: theme.success || '#10B981',
      paddingHorizontal: moderateScale(8),
      paddingVertical: moderateScale(4),
      borderRadius: moderateScale(4),
    },
    purchasedBadgeText: {
      fontSize: moderateScale(10),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.white,
    },

    // Billing Cycle Badge
    billingCycleBadge: {
      paddingHorizontal: moderateScale(8),
      paddingVertical: moderateScale(4),
      borderRadius: moderateScale(4),
      backgroundColor: theme.themeColor + '20',
    },
    freeBadge: {
      backgroundColor: theme.themeColor,
    },
    monthlyBadge: {
      backgroundColor: theme.themeColor,
    },
    yearlyBadge: {
      backgroundColor: theme.themeColor,
    },
    billingCycleBadgeText: {
      fontSize: moderateScale(10),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
    },

    // Price Container
    priceContainer: {
      alignItems: 'flex-end',
      minWidth: moderateScale(80),
    },
    priceText: {
      fontSize: moderateScale(22),
      fontFamily: FontFamily.KhulaExtraBold,
      color: theme.text,
      textAlign: 'right',
    },
    selectedPriceText: {
      color: theme.themeColor,
    },
    freePriceText: {
      color: '#10B981',
    },

    // Features Styles
    planFeatures: {
      marginTop: moderateScale(10),
      marginBottom: moderateScale(15),
    },
    featureItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: moderateScale(8),
    },
    featureIconContainer: {
      width: moderateScale(20),
      height: moderateScale(20),
      borderRadius: moderateScale(10),
      backgroundColor: theme.themeColor + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: moderateScale(10),
    },
    featureIcon: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.themeColor,
    },
    selectedFeatureIcon: {
      color: theme.themeColor,
    },
    featureItem: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.text,
      flex: 1,
      lineHeight: moderateScale(20),
    },
    selectedFeatureItem: {
      color: theme.themeColor,
      fontFamily: FontFamily.KhulaSemiBold,
    },

    // Button Styles
    subscribeBtn: {
      marginTop: moderateScale(5),
      borderRadius: moderateScale(10),
    },

    // Radio Circle
    radioCircle: {
      position: 'absolute',
      top: moderateScale(20),
      right: moderateScale(20),
      width: moderateScale(24),
      height: moderateScale(24),
      borderRadius: 12,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
    },
    radioDot: {
      width: moderateScale(12),
      height: moderateScale(12),
      borderRadius: 6,
    },

    // No Plans Container
    noPlansContainer: {
      paddingVertical: moderateScale(40),
      alignItems: 'center',
    },
    noPlansText: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.textSub,
      textAlign: 'center',
    },

    // Footer Styles
    footerContainer: {
      marginTop: moderateScale(20),
      padding: moderateScale(15),
      backgroundColor: theme.boxBackground,
      borderRadius: moderateScale(10),
    },
    footerText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.textSub,
      marginBottom: moderateScale(5),
    },
  });

export default SubscriptionScreen;

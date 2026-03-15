// export const BASE_URL = 'https://dev-daradoll.jamsara.com/api/v1'; //Live
export const BASE_URL = 'https://api.darabuddy.com/api/v1'; //Live
// export const BASE_URL = 'http://192.168.29.109:8004/api/v1';
// export const BASE_URL = 'https://raguel-tenne-agonizedly.ngrok-free.dev/api/v1'
// export const SOCKET_URL = 'https://raguel-tenne-agonizedly.ngrok-free.dev/socket'; //Local
export const SOCKET_URL = 'https://api.darabuddy.com/socket';

export const ApiURL = {
  // global Api
  getCountry: `${BASE_URL}/global/settings/countries`,

  // Auth
  register: `${BASE_URL}/auth/users/register`,
  verifyRegisterOtp: `${BASE_URL}/auth/users/verify-register-otp`,
  setLanguagePreference: `${BASE_URL}/auth/users/set-language-preference`,
  setSecurityPin: `${BASE_URL}/auth/users/setup-security-pin`,
  verifySecurityPin: `${BASE_URL}/auth/users/verify-security-pin`,
  securityPinRequestOtp: `${BASE_URL}/auth/users/security-pin-request-otp`,
  securityPinVerifyOtp: `${BASE_URL}/auth/users/security-pin-verify-otp`,
  securityPinReset: `${BASE_URL}/auth/users/security-pin-reset`,
  login: `${BASE_URL}/auth/users/login`,
  forgetPassword: `${BASE_URL}/auth/users/forgot-password`,
  forgetPasswordOtpVerify: `${BASE_URL}/auth/users/verify-forgot-password-otp`,
  resetPassword: `${BASE_URL}/auth/users/reset-password`, // DONE

  // Others
  getSettingsdata: `${BASE_URL}/global/settings`,
  setThemePreference: `${BASE_URL}/auth/users/set-theme-preference`, // DONE
  raiseTicket: `${BASE_URL}/ticket/users/raise-ticket`, // DONE
  getTickets: `${BASE_URL}/ticket/users/list`, // DONE
  raisedTicketChatsList: `${BASE_URL}/ticket/users/chats`, // DONE
  fileUpload: `${BASE_URL}/global/settings/upload`, // DONE

  // Profile
  getProfile: `${BASE_URL}/auth/users/view-profile`, // DONE
  fetchActiveProfiles: `${BASE_URL}/children/active-children`, // DONE
  fetchAvatarsProfiles: `${BASE_URL}/auth/users/avatars`, // DONE
  fetchChildrenlist: `${BASE_URL}/children/list`, // DONE
  toggleChildActiveStatus: `${BASE_URL}/children/active-inactive`, // DONE
  updateProfile: `${BASE_URL}/auth/users/update-profile`,
  updatePassword: `${BASE_URL}/auth/users/change-password`,

  // Child Model
  createNewChild: `${BASE_URL}/children/create`, // DONE
  updateNewChild: `${BASE_URL}/children/update`, // DONE
  fetchAge: `${BASE_URL}/categories/users/all-documents`, // DONE

  // Models
  getModelsList: `${BASE_URL}/devices/users/list`, // DONE
  getModelDetails: `${BASE_URL}/devices/users/view-document`, //DONE

  // Notification
  updateNotificationSetting: `${BASE_URL}/auth/users/update-notification-settings`,
  getNotificationsList: `${BASE_URL}/notifications/users/list`, // DONE
  markNotificationRead: `${BASE_URL}/notifications/users/mark-as-read`, // DONE
  markAllNotificationsRead: `${BASE_URL}/notifications/users/mark-all-as-read`, // DONE
  getNotificationsCount: `${BASE_URL}/notifications/users/counts`, // DONE

  // Help & Support
  TermsAndConditions: `${BASE_URL}/cms/users/terms-and-conditions`, // DONE
  PrivacyPolicy: `${BASE_URL}/cms/users/privacy-policies`, // DONE
  faq: `${BASE_URL}/cms/users/faqs`, // DONE

  // Logout
  logout: `${BASE_URL}/auth/users/logout`, // DONE

  // Chiled Screen

  // Add Schdule Session
  AddSession: `${BASE_URL}/content/users/add-schedule-session`, // DONE
  updateSession: `${BASE_URL}/content/users/update-schedule-session`, // DONE
  deleteSession: `${BASE_URL}/content/users/delete-schedule-session`, // DONE
  schduleSession: `${BASE_URL}/content/users/schedule-sessions`, // DONE
  categories_users_list: `${BASE_URL}/categories/users/list`, // DONE
  ExistingSession: `${BASE_URL}/content/users/list`, // DONE
  favouriteSession: `${BASE_URL}/content/users/toggle-favorite-content`,

  //  banner
  getbanner: `${BASE_URL}/promotion-banner/users/all-documents`, // DONE

  // subscription

  subscribtion: `${BASE_URL}/subscription/users/list`, // DONE
  purchase: `${BASE_URL}/subscription/users/purchase`,
  status: `${BASE_URL}/subscription/users/status`,
  renew: `${BASE_URL}/subscription/users/renew`,
  ToggleFavoriteContent: `${BASE_URL}/content/users/toggle-favorite-content`,
  content_users_toggle_restrict_content: `${BASE_URL}/content/users/toggle-restrict-content`,

  // favourite channel
  favouriteChannel: `${BASE_URL}/categories/users/favorite-categories`,

  //  child update Password
  childUpdatePassword: `${BASE_URL}/children/update-password`,
  //soft delete
  deleteChild: `${BASE_URL}/children/soft-delete`,
  viewContentData: `${BASE_URL}/content/users/view-document`,

  // Analytics data of child
  lastPlayed: `${BASE_URL}/analytics/users/last-played-content`,
  childPlayHistory: `${BASE_URL}/analytics/users/played-content-history`,
  NEXT_SCHEDULED_SESSION: `${BASE_URL}/content/users/next-schedule-session`,
  mostPlayed: `${BASE_URL}/analytics/users/most-played`,
  progress: `${BASE_URL}/analytics/users/progress`,
  screenTime: `${BASE_URL}/analytics/users/screen-time`,

  // multiple language
  getLanguageSetting: `${BASE_URL}/global/settings/translations`,
};

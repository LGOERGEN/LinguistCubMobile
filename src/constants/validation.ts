// App validation constants and limits
export const VALIDATION_LIMITS = {
  // Child Profile Limits
  MAX_CHILD_PROFILES: 8,
  CHILD_NAME_MIN_LENGTH: 2,
  CHILD_NAME_MAX_LENGTH: 25,
  MIN_CHILD_AGE_YEARS: 0,
  MAX_CHILD_AGE_YEARS: 25,

  // Word & Content Limits
  CUSTOM_WORD_MIN_LENGTH: 1,
  CUSTOM_WORD_MAX_LENGTH: 40,
  MAX_CUSTOM_WORDS_PER_CATEGORY: 150,
  MAX_TOTAL_WORDS_PER_LANGUAGE: 1000,
  SEARCH_QUERY_MAX_LENGTH: 50,

  // Performance Limits
  LANGUAGE_SWITCH_COOLDOWN_MS: 3000,
  MAX_BULK_OPERATIONS: 20,
  EXPORT_GENERATION_COOLDOWN_MS: 10000,

  // Data Storage Limits
  MAX_PROFILE_PHOTO_SIZE_MB: 5,
  MAX_APP_DATA_SIZE_MB: 100,
  DATA_WARNING_SIZE_MB: 50,
  MAX_EXPORT_FILE_SIZE_MB: 20,
};

// Validation error messages
export const VALIDATION_MESSAGES = {
  // Child Profile Errors
  MAX_PROFILES_REACHED: `You can create a maximum of ${VALIDATION_LIMITS.MAX_CHILD_PROFILES} child profiles.`,
  CHILD_NAME_TOO_SHORT: `Child name must be at least ${VALIDATION_LIMITS.CHILD_NAME_MIN_LENGTH} characters long.`,
  CHILD_NAME_TOO_LONG: `Child name must be no more than ${VALIDATION_LIMITS.CHILD_NAME_MAX_LENGTH} characters long.`,
  CHILD_NAME_DUPLICATE: 'A child profile with this name already exists.',
  CHILD_NAME_INVALID: 'Child name contains invalid characters.',
  CHILD_AGE_INVALID: `Child age must be between ${VALIDATION_LIMITS.MIN_CHILD_AGE_YEARS} and ${VALIDATION_LIMITS.MAX_CHILD_AGE_YEARS} years.`,
  BIRTH_DATE_FUTURE: 'Birth date cannot be in the future.',
  BIRTH_DATE_TOO_OLD: 'Birth date is too far in the past.',
  MUST_SELECT_LANGUAGE: 'Please select at least one language.',

  // Word & Content Errors
  WORD_TOO_SHORT: `Word must be at least ${VALIDATION_LIMITS.CUSTOM_WORD_MIN_LENGTH} character long.`,
  WORD_TOO_LONG: `Word must be no more than ${VALIDATION_LIMITS.CUSTOM_WORD_MAX_LENGTH} characters long.`,
  WORD_INVALID_CHARS: 'Word contains invalid characters.',
  WORD_ALREADY_EXISTS: 'This word already exists in the selected category.',
  CATEGORY_WORD_LIMIT: `This category has reached the maximum of ${VALIDATION_LIMITS.MAX_CUSTOM_WORDS_PER_CATEGORY} words.`,
  LANGUAGE_WORD_LIMIT: `This language has reached the maximum of ${VALIDATION_LIMITS.MAX_TOTAL_WORDS_PER_LANGUAGE} words.`,
  SEARCH_TOO_LONG: `Search query must be no more than ${VALIDATION_LIMITS.SEARCH_QUERY_MAX_LENGTH} characters long.`,

  // Performance Errors
  LANGUAGE_SWITCH_COOLDOWN: 'Please wait a moment before switching languages again.',
  TOO_MANY_OPERATIONS: `Cannot process more than ${VALIDATION_LIMITS.MAX_BULK_OPERATIONS} items at once.`,
  EXPORT_COOLDOWN: 'Please wait before generating another export.',

  // Data Storage Errors
  PHOTO_TOO_LARGE: `Photo size must be less than ${VALIDATION_LIMITS.MAX_PROFILE_PHOTO_SIZE_MB}MB.`,
  APP_DATA_WARNING: `App data is approaching the ${VALIDATION_LIMITS.DATA_WARNING_SIZE_MB}MB limit.`,
  APP_DATA_LIMIT: `App data has reached the ${VALIDATION_LIMITS.MAX_APP_DATA_SIZE_MB}MB limit.`,
  EXPORT_TOO_LARGE: `Export file is too large (max ${VALIDATION_LIMITS.MAX_EXPORT_FILE_SIZE_MB}MB).`,
};

// Validation utility functions
export class ValidationUtils {
  // Child name validation
  static validateChildName(name: string): { isValid: boolean; error?: string } {
    if (!name || name.trim().length < VALIDATION_LIMITS.CHILD_NAME_MIN_LENGTH) {
      return { isValid: false, error: VALIDATION_MESSAGES.CHILD_NAME_TOO_SHORT };
    }

    if (name.length > VALIDATION_LIMITS.CHILD_NAME_MAX_LENGTH) {
      return { isValid: false, error: VALIDATION_MESSAGES.CHILD_NAME_TOO_LONG };
    }

    // Check for invalid characters (allow letters, spaces, hyphens, apostrophes)
    const validNameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!validNameRegex.test(name.trim())) {
      return { isValid: false, error: VALIDATION_MESSAGES.CHILD_NAME_INVALID };
    }

    return { isValid: true };
  }

  // Check for duplicate child names
  static checkDuplicateChildName(name: string, existingNames: string[], currentChildId?: string): { isValid: boolean; error?: string } {
    const normalizedName = name.trim().toLowerCase();
    const isDuplicate = existingNames.some((existingName, index) => {
      // Skip the current child if we're editing
      if (currentChildId && index.toString() === currentChildId) {
        return false;
      }
      return existingName.toLowerCase() === normalizedName;
    });

    if (isDuplicate) {
      return { isValid: false, error: VALIDATION_MESSAGES.CHILD_NAME_DUPLICATE };
    }

    return { isValid: true };
  }

  // Birth date validation
  static validateBirthDate(birthDate: string): { isValid: boolean; error?: string } {
    if (!birthDate) {
      return { isValid: true }; // Birth date is optional
    }

    const date = new Date(birthDate);
    const now = new Date();

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Invalid birth date format.' };
    }

    // Check if date is in the future
    if (date > now) {
      return { isValid: false, error: VALIDATION_MESSAGES.BIRTH_DATE_FUTURE };
    }

    // Check if birth year is before 1925
    if (date.getFullYear() < 1925) {
      return { isValid: false, error: 'Birth year cannot be before 1925.' };
    }

    // Check if age is within reasonable bounds
    const ageInYears = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (ageInYears > VALIDATION_LIMITS.MAX_CHILD_AGE_YEARS) {
      return { isValid: false, error: VALIDATION_MESSAGES.BIRTH_DATE_TOO_OLD };
    }

    return { isValid: true };
  }

  // Word validation
  static validateWord(word: string): { isValid: boolean; error?: string } {
    if (!word || word.trim().length < VALIDATION_LIMITS.CUSTOM_WORD_MIN_LENGTH) {
      return { isValid: false, error: VALIDATION_MESSAGES.WORD_TOO_SHORT };
    }

    if (word.length > VALIDATION_LIMITS.CUSTOM_WORD_MAX_LENGTH) {
      return { isValid: false, error: VALIDATION_MESSAGES.WORD_TOO_LONG };
    }

    // Allow letters, numbers, spaces, hyphens, apostrophes, and common punctuation
    const validWordRegex = /^[a-zA-ZÀ-ÿ0-9\s'.-]+$/;
    if (!validWordRegex.test(word.trim())) {
      return { isValid: false, error: VALIDATION_MESSAGES.WORD_INVALID_CHARS };
    }

    return { isValid: true };
  }

  // Search query validation
  static validateSearchQuery(query: string): { isValid: boolean; error?: string } {
    if (query.length > VALIDATION_LIMITS.SEARCH_QUERY_MAX_LENGTH) {
      return { isValid: false, error: VALIDATION_MESSAGES.SEARCH_TOO_LONG };
    }

    return { isValid: true };
  }

  // Sanitize text input
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000); // Hard limit to prevent extremely long inputs
  }

  // Check if maximum profiles reached
  static canAddChildProfile(currentProfileCount: number): { canAdd: boolean; error?: string } {
    if (currentProfileCount >= VALIDATION_LIMITS.MAX_CHILD_PROFILES) {
      return { canAdd: false, error: VALIDATION_MESSAGES.MAX_PROFILES_REACHED };
    }

    return { canAdd: true };
  }

  // Check word limits for category
  static canAddWordToCategory(currentWordCount: number): { canAdd: boolean; error?: string } {
    if (currentWordCount >= VALIDATION_LIMITS.MAX_CUSTOM_WORDS_PER_CATEGORY) {
      return { canAdd: false, error: VALIDATION_MESSAGES.CATEGORY_WORD_LIMIT };
    }

    return { canAdd: true };
  }

  // Check total word limits for language
  static canAddWordToLanguage(currentWordCount: number): { canAdd: boolean; error?: string } {
    if (currentWordCount >= VALIDATION_LIMITS.MAX_TOTAL_WORDS_PER_LANGUAGE) {
      return { canAdd: false, error: VALIDATION_MESSAGES.LANGUAGE_WORD_LIMIT };
    }

    return { canAdd: true };
  }
}
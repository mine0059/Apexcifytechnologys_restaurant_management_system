/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

/**
 * Generate a random username (e.g. user-abc123)
 */
export const genUsername = (): string => {
    const usernamePrefix = 'user-';
    const randomChars = Math.random().toString(36).slice(2);

    const username = usernamePrefix + randomChars;

    return username;
}
/**
 * Mock publishing for Instagram (used when real tokens are unavailable).
 */
const simulatePublish = async (variant, media) => {
  return new Promise((resolve) => {
    // Simulate network delay to Instagram API
    setTimeout(() => {
      console.log(`[Instagram Mock] Successfully published post: "${variant.caption.substring(0, 20)}..."`);
      resolve({
        success: true,
        platformPostId: `ig_mock_${Date.now()}`
      });
    }, 2000);
  });
};

module.exports = {
  publish: simulatePublish
};

const simulatePublish = async (variant, media) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[Twitter/X] Successfully published tweet: "${variant.caption.substring(0, 20)}..."`);
      resolve({
        success: true,
        platformPostId: `x_${Date.now()}`
      });
    }, 800);
  });
};

module.exports = {
  publish: simulatePublish
};

const simulatePublish = async (variant, media) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[Facebook] Successfully published post: "${variant.caption.substring(0, 20)}..."`);
        resolve({
          success: true,
          platformPostId: `fb_${Date.now()}`
        });
      }, 1200);
    });
  };
  
  module.exports = {
    publish: simulatePublish
  };

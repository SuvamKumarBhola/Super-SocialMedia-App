const simulatePublish = async (variant, media) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[LinkedIn] Successfully published post: "${variant.caption.substring(0, 20)}..."`);
        resolve({
          success: true,
          platformPostId: `li_${Date.now()}`
        });
      }, 1000);
    });
  };
  
  module.exports = {
    publish: simulatePublish
  };

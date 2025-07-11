/**
 * Safari specific zone.js configuration
 * This file should be imported before zone.js to configure Safari-specific behavior
 */

// Safari sometimes has issues with requestAnimationFrame patching
// Uncomment if you experience animation issues in Safari
// (window as any).__Zone_disable_requestAnimationFrame = true;

// Safari might have issues with certain event listeners
// Uncomment if you experience event handling issues
// (window as any).__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove'];

// Enable cross-context check for Safari
(window as any).__Zone_enable_cross_context_check = true;

// Patch Safari's Promise implementation if needed
if (typeof window !== 'undefined' && window.navigator && window.navigator.userAgent) {
  const isSafari = /Safari/.test(window.navigator.userAgent) && /Apple Computer/.test(window.navigator.vendor);
  if (isSafari) {
    // Safari-specific configurations
    console.log('Safari detected - applying Safari-specific zone.js configurations');
    
    // Safari sometimes has issues with resize events
    // Uncomment if you experience resize handling issues
    // (window as any).__zone_symbol__UNPATCHED_EVENTS = ['resize'];
    
    // Ensure window object is properly available
    if (!window.document) {
      console.warn('Document not available in Safari - this may cause viewport issues');
    }
  }
}

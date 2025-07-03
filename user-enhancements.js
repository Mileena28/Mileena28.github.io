// User Experience Enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Create back to top button
    const backToTop = document.createElement('div');
    backToTop.innerHTML = '↑';
    backToTop.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #8a9fff, #a8b5ff);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
        color: #000;
        font-weight: bold;
        font-size: 1.2em;
    `;
    
    document.body.appendChild(backToTop);
    
    // Show/hide on scroll
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.style.opacity = '1';
        } else {
            backToTop.style.opacity = '0';
        }
    });
    
    // Click to scroll to top
    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Initialize social share after page loads
    addSocialShare();
});

// Social Share Buttons Function
function addSocialShare() {
    // Only add to posts and chapters
    const content = document.querySelector('.post-body, .chapter-content');
    if (!content) return;
    
    // Create share container
    const shareDiv = document.createElement('div');
    shareDiv.style.cssText = `
        display: flex;
        gap: 15px;
        align-items: center;
        margin: 30px 0;
        padding: 20px;
        background: rgba(30, 30, 30, 0.8);
        border-radius: 10px;
        justify-content: center;
        flex-wrap: wrap;
    `;
    
    shareDiv.innerHTML = `
        <span style="color: #999; font-size: 0.9em; margin-right: 10px;">Share:</span>
        <a href="#" class="share-twitter" style="background: #1da1f2; color: white; padding: 8px 15px; border-radius: 20px; text-decoration: none; font-size: 0.9em;">Twitter</a>
        <a href="#" class="share-facebook" style="background: #3b5998; color: white; padding: 8px 15px; border-radius: 20px; text-decoration: none; font-size: 0.9em;">Facebook</a>
        <a href="#" class="share-reddit" style="background: #ff4500; color: white; padding: 8px 15px; border-radius: 20px; text-decoration: none; font-size: 0.9em;">Reddit</a>
    `;
    
    // Add to content
    const firstP = content.querySelector('p');
    if (firstP) {
        firstP.after(shareDiv);
    }
    
    // Add click handlers
    shareDiv.addEventListener('click', function(e) {
        if (e.target.classList.contains('share-twitter')) {
            e.preventDefault();
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, 'share', 'width=600,height=400');
        } else if (e.target.classList.contains('share-facebook')) {
            e.preventDefault();
            const url = encodeURIComponent(window.location.href);
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, 'share', 'width=600,height=400');
        } else if (e.target.classList.contains('share-reddit')) {
            e.preventDefault();
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            window.open(`https://reddit.com/submit?url=${url}&title=${title}`, 'share', 'width=600,height=400');
        }
    });
}

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

// Beautiful Social Share Buttons Function
function addSocialShare() {
    // Only add to posts and chapters
    const content = document.querySelector('.post-body, .chapter-content');
    if (!content) return;
    
    // Create beautiful share container
    function createShareContainer(position = 'top') {
        const shareDiv = document.createElement('div');
        shareDiv.style.cssText = `
            background: linear-gradient(135deg, rgba(138, 159, 255, 0.15), rgba(138, 159, 255, 0.08));
            border: 1px solid rgba(138, 159, 255, 0.3);
            border-radius: 20px;
            padding: 25px;
            margin: 40px 0;
            text-align: center;
            backdrop-filter: blur(10px);
            position: relative;
            overflow: hidden;
        `;
        
        // Add subtle animation background
        shareDiv.innerHTML = `
            <div style="color: #8a9fff; font-size: 1.1em; font-weight: 600; margin-bottom: 20px; letter-spacing: 1px;">
                ${position === 'top' ? 'Share This Story' : 'Enjoyed This? Share It'}
            </div>
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <button class="share-twitter" style="
                    background: linear-gradient(135deg, #1da1f2, #0d8bd9);
                    border: none;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 25px;
                    font-size: 0.9em;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 15px rgba(29, 161, 242, 0.3);
                    position: relative;
                    overflow: hidden;
                ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Twitter
                </button>
                
                <button class="share-facebook" style="
                    background: linear-gradient(135deg, #3b5998, #2d4373);
                    border: none;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 25px;
                    font-size: 0.9em;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 15px rgba(59, 89, 152, 0.3);
                    position: relative;
                    overflow: hidden;
                ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                </button>
                
                <button class="share-reddit" style="
                    background: linear-gradient(135deg, #ff4500, #cc3600);
                    border: none;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 25px;
                    font-size: 0.9em;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 15px rgba(255, 69, 0, 0.3);
                    position: relative;
                    overflow: hidden;
                ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z"/>
                    </svg>
                    Reddit
                </button>
                
                <button class="share-copy" style="
                    background: linear-gradient(135deg, rgba(138, 159, 255, 0.8), rgba(168, 181, 255, 0.6));
                    border: 1px solid rgba(138, 159, 255, 0.5);
                    color: #8a9fff;
                    padding: 12px 20px;
                    border-radius: 25px;
                    font-size: 0.9em;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 15px rgba(138, 159, 255, 0.2);
                    position: relative;
                    overflow: hidden;
                ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    Copy Link
                </button>
            </div>
        `;
        
        // Add beautiful hover effects
        shareDiv.querySelectorAll('button').forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-3px) scale(1.05)';
                this.style.boxShadow = this.style.boxShadow.replace('4px', '8px').replace('15px', '25px');
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = this.style.boxShadow.replace('8px', '4px').replace('25px', '15px');
            });
            
            // Add ripple effect on click
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });
        
        // Add ripple animation
        if (!document.querySelector('#ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add click handlers
        shareDiv.addEventListener('click', function(e) {
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            
            if (e.target.closest('.share-twitter')) {
                e.preventDefault();
                window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, 'share', 'width=600,height=400');
            } else if (e.target.closest('.share-facebook')) {
                e.preventDefault();
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, 'share', 'width=600,height=400');
            } else if (e.target.closest('.share-reddit')) {
                e.preventDefault();
                window.open(`https://reddit.com/submit?url=${url}&title=${title}`, 'share', 'width=600,height=400');
            } else if (e.target.closest('.share-copy')) {
                e.preventDefault();
                navigator.clipboard.writeText(window.location.href).then(() => {
                    const button = e.target.closest('.share-copy');
                    const originalText = button.innerHTML;
                    button.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        Copied!
                    `;
                    button.style.background = 'linear-gradient(135deg, #4caf50, #45a049)';
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.style.background = 'linear-gradient(135deg, rgba(138, 159, 255, 0.8), rgba(168, 181, 255, 0.6))';
                    }, 2000);
                });
            }
        });
        
        return shareDiv;
    }
    
    // Add share buttons at the beginning and end
    const topShare = createShareContainer('top');
    const bottomShare = createShareContainer('bottom');
    
    // Insert at beginning
    content.insertBefore(topShare, content.firstChild);
    
    // Insert at end
    content.appendChild(bottomShare);
}

# Hero Banner Headline Options

## Option 1: Factory-Direct Focus

**Headline:** "Factory-Direct Quality, East London Prices"  
**Subheadline:** "Premium blinds, curtains & flooring delivered nationwide from our East London warehouse"  
**CTA Button:** "Shop Factory-Direct"

### Styling Code:
```css
/* Hero Banner Styling - Option 1 */
.hero-banner-1 {
    background: linear-gradient(135deg, #111111 0%, #333333 100%);
    color: #F5F5F5;
    text-align: center;
    padding: 4rem 2rem;
    position: relative;
    overflow: hidden;
}

.hero-banner-1::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/wp-content/uploads/hero-bg-1.jpg') center/cover;
    opacity: 0.3;
    z-index: 1;
}

.hero-content-1 {
    position: relative;
    z-index: 2;
    max-width: 1200px;
    margin: 0 auto;
}

.hero-title-1 {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 700;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    line-height: 1.2;
}

.hero-subtitle-1 {
    font-size: clamp(1.1rem, 2vw, 1.3rem);
    color: #D4B896;
    margin-bottom: 2rem;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
}

.hero-cta-1 {
    background: #C9A227;
    color: #111111;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    text-decoration: none;
    border-radius: 0;
    display: inline-block;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.hero-cta-1:hover {
    background: #B8921F;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(201, 162, 39, 0.3);
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .hero-banner-1 {
        padding: 3rem 1rem;
    }
    
    .hero-title-1 {
        font-size: 2rem;
    }
    
    .hero-subtitle-1 {
        font-size: 1rem;
    }
}
```

## Option 2: Local Pride & Savings

**Headline:** "Proudly East London, Saving You Money"  
**Subheadline:** "From our factory to your home - quality decor at prices that beat the big retailers"  
**CTA Button:** "Get Your Free Quote"

### Styling Code:
```css
/* Hero Banner Styling - Option 2 */
.hero-banner-2 {
    background: #D4B896;
    color: #111111;
    text-align: center;
    padding: 4rem 2rem;
    position: relative;
}

.hero-content-2 {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
}

.hero-title-2 {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 700;
    margin-bottom: 1rem;
    line-height: 1.2;
    text-shadow: 1px 1px 2px rgba(255,255,255,0.3);
}

.hero-subtitle-2 {
    font-size: clamp(1.1rem, 2vw, 1.3rem);
    color: #333333;
    margin-bottom: 2rem;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    font-weight: 400;
}

.hero-cta-2 {
    background: #111111;
    color: #F5F5F5;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    text-decoration: none;
    border-radius: 0;
    display: inline-block;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.hero-cta-2:hover {
    background: #333333;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(17, 17, 17, 0.3);
}

/* Decorative Elements */
.hero-banner-2::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    bottom: 20px;
    border: 2px solid #C9A227;
    pointer-events: none;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .hero-banner-2 {
        padding: 3rem 1rem;
    }
    
    .hero-title-2 {
        font-size: 2rem;
    }
    
    .hero-subtitle-2 {
        font-size: 1rem;
    }
    
    .hero-banner-2::before {
        top: 10px;
        left: 10px;
        right: 10px;
        bottom: 10px;
    }
}
```

## Option 3: Service & Convenience

**Headline:** "Measure • Quote • Install • Enjoy"  
**Subheadline:** "Complete home transformation service from East London's factory-direct experts"  
**CTA Button:** "Start Your Project"

### Styling Code:
```css
/* Hero Banner Styling - Option 3 */
.hero-banner-3 {
    background: linear-gradient(45deg, #C9A227 0%, #D4B896 100%);
    color: #111111;
    text-align: center;
    padding: 4rem 2rem;
    position: relative;
    overflow: hidden;
}

.hero-banner-3::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255,255,255,0.05) 10px,
        rgba(255,255,255,0.05) 20px
    );
    animation: slide 20s linear infinite;
    z-index: 1;
}

@keyframes slide {
    0% { transform: translate(0, 0); }
    100% { transform: translate(50px, 50px); }
}

.hero-content-3 {
    position: relative;
    z-index: 2;
    max-width: 1200px;
    margin: 0 auto;
}

.hero-title-3 {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 700;
    margin-bottom: 1rem;
    line-height: 1.2;
    text-shadow: 1px 1px 2px rgba(255,255,255,0.3);
}

.hero-subtitle-3 {
    font-size: clamp(1.1rem, 2vw, 1.3rem);
    color: #333333;
    margin-bottom: 2rem;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    font-weight: 400;
}

.hero-cta-3 {
    background: #111111;
    color: #F5F5F5;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    text-decoration: none;
    border-radius: 0;
    display: inline-block;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    overflow: hidden;
}

.hero-cta-3::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
}

.hero-cta-3:hover::before {
    left: 100%;
}

.hero-cta-3:hover {
    background: #333333;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(17, 17, 17, 0.4);
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .hero-banner-3 {
        padding: 3rem 1rem;
    }
    
    .hero-title-3 {
        font-size: 2rem;
    }
    
    .hero-subtitle-3 {
        font-size: 1rem;
    }
}
```

## Implementation Instructions

1. **Choose your preferred headline option** and copy the corresponding CSS code

2. **Add to WordPress:**
   - Go to **Appearance → Customize → Additional CSS**
   - Paste the CSS code
   - Click **Publish** to save

3. **Create the hero banner:**
   - Use the Gutenberg **Cover Block** for the background image
   - Add **Heading Block** for the title
   - Add **Paragraph Block** for the subtitle  
   - Add **Button Block** for the CTA

4. **Assign CSS classes:**
   - Add `hero-banner-1` (or 2 or 3) to the Cover Block
   - Add `hero-content-1` to the Group Block inside
   - Add `hero-title-1` to the Heading Block
   - Add `hero-subtitle-1` to the Paragraph Block
   - Add `hero-cta-1` to the Button Block

5. **Customize colors** using the CSS variables:
   ```css
   :root {
       --kayleigh-black: #111111;
       --kayleigh-beige: #D4B896;
       --kayleigh-white: #F5F5F5;
       --kayleigh-gold: #C9A227;
   }
   ```

## Recommended Headline

**Option 1** is recommended as it clearly communicates your unique value proposition: factory-direct quality with local East London pricing. This immediately sets you apart from big retailers and emphasizes your local connection.

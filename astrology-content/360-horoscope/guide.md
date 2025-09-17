# Complete 360-Day Fantasy Horoscope System
*The Eternal Wheel of Cosmic Influence*

---

## Conversion System: Earth Date to Arcadian Reading

```javascript
function getArcadianConstellation(earthDate) {
  const month = earthDate.getMonth(); // 0-11
  const day = earthDate.getDate(); // 1-31
  
  // Convert Earth date to constellation
  if (month === 0) return "Awakener"; // January 1-30
  if (month === 1 || (month === 2 && day === 1)) return "Lovers"; // Jan 31 - Mar 1
  if (month === 2 && day >= 2) return "Wanderer"; // Mar 2-31
  if (month === 3) return "Garden"; // April 1-30
  if (month === 4) return "Guardians"; // May 1-30
  if (month === 5 && day <= 29) return "Crown"; // May 31 - Jun 29
  if ((month === 5 && day >= 30) || (month === 6 && day <= 29)) return "Shepherd"; // Jun 30 - Jul 29
  if ((month === 6 && day >= 30) || (month === 7 && day <= 28)) return "Hunter"; // Jul 30 - Aug 28
  if ((month === 7 && day >= 29) || (month === 8 && day <= 27)) return "Storm"; // Aug 29 - Sep 27
  if ((month === 8 && day >= 28) || (month === 9 && day <= 27)) return "Tower"; // Sep 28 - Oct 27
  if ((month === 9 && day >= 28) || (month === 10 && day <= 26)) return "Dragon"; // Oct 28 - Nov 26
  if ((month === 10 && day >= 27) || month === 11) return "Broken Chain"; // Nov 27 - Dec 31
}

function getDailyHoroscope(date) {
  const dayOfYear = getDayOfYear(date);
  
  // Map to Arcadian calendar day (1-360)
  // Days 361-366 of Earth year wrap to Broken Chain extended period
  const arcadianDay = dayOfYear <= 360 ? dayOfYear : 360;
  
  const arcadianMonth = Math.ceil(arcadianDay / 30);
  const dayOfMonth = arcadianDay - ((arcadianMonth - 1) * 30);
  
  return {
    constellation: getConstellation(arcadianMonth),
    moonPhase: getMoonPhase(dayOfMonth),
    house: getHouse(dayOfMonth),
    reading: getReading(arcadianDay)
  };
}
```

### Quick Reference: Earth to Arcadian Calendar

| Earth Dates | Days | Arcadian Month | Ruling Constellation | Element |
|------------|------|----------------|---------------------|---------|
| Jan 1-30 | 30 | Month 1 | The Awakener | Transformation |
| Jan 31 - Mar 1 | 30 | Month 2 | The Lovers | Eternal Bond |
| Mar 2-31 | 30 | Month 3 | The Wanderer | Endless Journey |
| Apr 1-30 | 30 | Month 4 | The Garden | Abundance |
| May 1-30 | 30 | Month 5 | The Guardians | Protection |
| May 31 - Jun 29 | 30 | Month 6 | The Crown | Sovereignty |
| Jun 30 - Jul 29 | 30 | Month 7 | The Shepherd | Gentleness |
| Jul 30 - Aug 28 | 30 | Month 8 | The Hunter | The Chase |
| Aug 29 - Sep 27 | 30 | Month 9 | The Storm | Tempest |
| Sep 28 - Oct 27 | 30 | Month 10 | The Tower | Isolation |
| Oct 28 - Nov 26 | 30 | Month 11 | The Dragon | Mystery |
| Nov 27 - Dec 31 | 35 | Month 12 | The Broken Chain | Liberation |

*Note: The Broken Chain claims 35 days, breaking the calendar's rules as befits the constellation of Liberation*

### House Activation Schedule (Repeats Monthly)

| Days of Month | House Activated | Domain |
|--------------|-----------------|---------|
| 1-2 | The Threshold | Identity, Self, New Beginnings |
| 3-5 | The Foundation | Resources, Values, Security |
| 6-7 | The Messenger | Communication, Learning, Siblings |
| 8-10 | The Sanctuary | Home, Family, Ancestry |
| 11-12 | The Crucible | Creativity, Romance, Children |
| 13-15 | The Ritual | Work, Health, Daily Routine |
| 16-17 | The Eternal Dance | Partnerships, Open Enemies |
| 18-20 | The Abyss | Death, Transformation, Shadow |
| 21-22 | The Horizon | Philosophy, Travel, Higher Learning |
| 23-25 | The Throne | Career, Reputation, Authority |
| 26-27 | The Community | Friends, Groups, Collective Dreams |
| 28-30 | The Void Temple | Hidden Things, Karma, Transcendence |

### Moon Phase Calendar (30-Day Cycle)

| Days | Phase | Emotional Energy |
|------|-------|-----------------|
| 1-4 | New Moon | The Hidden Seed - Invisible beginnings |
| 5-8 | Waxing Crescent | The Determined Heart - Aggressive growth |
| 9-12 | First Quarter | The Heart at War - Internal conflict |
| 13-17 | Waxing Gibbous | The Overflowing Cup - Emotional intensity |
| 18-21 | Full Moon | The Illuminated Mirror - Complete visibility |
| 22-25 | Waning Gibbous | The Wise Griever - Release and wisdom |
| 26-28 | Last Quarter | The Integrated Shadow - Accepting paradox |
| 29-30 | Dark Moon | The Void Touched - Mystical emptiness |

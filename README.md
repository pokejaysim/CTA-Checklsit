# Clinical Trial Management Suite

A comprehensive web-based suite of tools for managing clinical trials, including a Clinical Trial Agreement (CTA) checklist and a budget calculator.

## Features

### 🏠 Landing Page
- Professional overview of available tools
- Easy navigation to different management tools
- Mobile-responsive design
- Clean, medical-themed interface

### 📋 Clinical Trial Agreement Checklist
- Comprehensive checklist for sponsor-initiated clinical trials
- Section references for easy document tracking
- Progress tracking with visual indicators
- Save/load functionality with local storage
- Export options (JSON, text)
- Notes sections for each category
- Print-friendly format

### 💰 Budget Calculator
- **Study Information Management**
  - Protocol details, PI information, sponsor tracking
  - Study duration and enrollment planning

- **Comprehensive Cost Categories**
  - Per-patient costs (visits, procedures, compensation)
  - Fixed study costs (initiation, monitoring, regulatory)
  - Equipment and supply costs
  - Personnel costs
  - Custom line items for each category

- **Advanced Features**
  - Real-time calculations
  - Multi-currency support (USD, EUR, GBP, CAD, AUD)
  - Overhead/indirect cost calculations
  - Invoice schedule with milestone payments
  - Progress tracking
  - Category-wise cost breakdown with percentages

- **Export Options**
  - PDF export (via print)
  - Excel spreadsheet with detailed breakdown
  - Text summary report
  - JSON data export/import

## Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with responsive design
- **Data Storage**: Browser localStorage
- **Libraries**: 
  - SheetJS (XLSX) for Excel export functionality
- **No backend required** - all data stored locally

## Installation & Deployment

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/jasonkneen/CTA-Checklsit.git
cd CTA-Checklsit
```

2. Open `index.html` in a web browser, or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

### GitHub Pages Deployment

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

2. Enable GitHub Pages:
   - Go to Settings → Pages
   - Select Source: Deploy from a branch
   - Select Branch: main
   - Select Folder: / (root)
   - Click Save

3. Your site will be available at:
   `https://[your-username].github.io/CTA-Checklsit/`

### Custom Domain (Optional)

1. Add a `CNAME` file to the root directory with your domain:
```
your-domain.com
```

2. Configure your domain's DNS:
   - Add A records pointing to GitHub's IPs
   - Or add a CNAME record pointing to `[your-username].github.io`

## File Structure

```
CTA-Checklsit/
├── index.html              # Landing page
├── cta-checklist.html      # CTA checklist tool
├── budget.html             # Budget calculator tool
├── assets/
│   ├── css/
│   │   ├── main.css       # Shared styles
│   │   ├── landing.css    # Landing page styles
│   │   └── budget.css     # Budget calculator styles
│   └── js/
│       └── budget.js      # Budget calculator logic
├── style.css              # Legacy checklist styles
├── script.js              # Legacy checklist script
└── README.md             # This file
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security & Privacy

- All data is stored locally in the browser
- No data is transmitted to external servers
- No user accounts or authentication required
- Data persists between sessions using localStorage
- Users can export and backup their data

## Usage Tips

### Budget Calculator
1. Start by filling in study information
2. Enter costs in each category - calculations update automatically
3. Add custom items as needed for your specific trial
4. Use the overhead percentage for indirect costs
5. Define payment milestones in the invoice schedule
6. Export to Excel for detailed analysis or PDF for reports

### CTA Checklist
1. Enter study details at the top
2. Check off items as you review the agreement
3. Add section references for easy document navigation
4. Use notes sections for important observations
5. Track progress with the visual indicator
6. Save/load checklists for different protocols

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is provided as-is for use by clinical research professionals. Please ensure compliance with your organization's policies when using these tools.

## Support

For questions or issues:
- Create an issue on GitHub
- Check existing issues for solutions
- Ensure JavaScript is enabled in your browser
- Clear browser cache if experiencing issues

## Future Enhancements

- Protocol deviation tracker
- Site monitoring visit scheduler
- Recruitment tracking dashboard
- Multi-site budget comparison
- Integration with clinical trial management systems

---

Built with ❤️ for the clinical research community
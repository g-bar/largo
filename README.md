# Largo E-Score dashboard

A static HTML rebuild of a Largo E-Score Celebrity scorecard, worked up from a single screenshot into a working page.

Available on: https://g-bar.github.io/largo/. 

## Going from mockup to implementation

The implementation was AI-assisted using Claude Opus and Claude Sonnet.

I used a Python script to get the exact colors from the image, for example the red card, the chart bars, the background, etc. That produced the color palette in `styles.css`, and the color values in `scorecard.js` for the charts.

###  Layout

Layout dimensions came from finding the x-coordinates where the color changes from page background to a card edge: cards start at x=147 and end at x=1133 in the 1280px image, giving a 986px content column centered with ~147px margins. The E-Score card measures 196px wide, the Awareness card 371px, and the news carousel fills the remainder.
Chart cards split the column into two equal halves. Gaps between cards measure 12px throughout.

The layout was implemented in `styles.css`. For the one-dimensional navigation bars (top bar, celebrity header, tabs bar) I used Flexbox, and for the main content (cards, charts and news carousel) I used CSS grid.

### News carousel
For the news section I implemented a carousel (`carousel.js`). It calculates how many cards fit in the available width (targeting ~150px per card), sizes them to fill the viewport exactly, and pages through them with arrow buttons. On resize it recalculates, so the number of visible cards adapts as the window changes.

### Responsive design

I made the site responsive, so that it looks good at different screen sizes, using media queries.

- **Below 1000px**: the E-Score and Awareness cards stay side by side on the top row, and the news carousel moves down to its own full-width row underneath them.
- **Below 768px**: everything goes single-column, including the chart grid. The nav links collapse behind a hamburger toggle.
- **Below 500px**: the header controls (date, filter, export) wrap onto multiple lines.


## Modeling the data

`data.js` includes dummy data for the charts and fake news items for the carousel.

Each record contains the data for a given subject (celebrity or category), segment (total, male, female, an age bracket) and fielding date.
 
Every chart is just getting one record, or more records when comparing across dimensions, for example:

- **Attributes** holds the subject (Brad Pitt) and date fixed, and varies the segment: the three bars per attribute are Total, Male, and Female.
- **Power Factors** holds the segment and date fixed, and varies the subject: it compares Brad Pitt against the "actors" category average.

The charts themselves are drawn with [ECharts](https://echarts.apache.org/) picked because it handles the value labels on bars, rotated axis labels, pie connector lines and clickable legends out of the box.

**The `%`/`#` toggle.**
When the user toggles to count mode, each percentage is converted to a headcount (`round(pct * base / 100)`). Brad Pitt's own numbers use his respondent base directly. Category benchmarks can't: their real base is on a different scale (all actors' respondents, not Brad Pitt's) therefore they're indexed to Brad Pitt's base and flagged as such, so the two sit on a comparable scale.

In this simple version, the nav links, section tabs, filter dropdown, chart controls, and the Export and Download Celebrity One-Sheet buttons are all non-functional placeholders. Every chart shows a single fielding date with no segment filter applied, except for the Male/Female split in the Attributes chart.

## Files

- `index.html` — page structure: nav, header, tabs, toolbar, top cards, four charts.
- `styles.css` — layout and pixel-sampled design tokens.
- `data.js` — sample scorecard records, one flat record per subject/segment/date.
- `scorecard.js` — reads that data and draws the charts and top cards.
- `carousel.js`, `nav.js` — news carousel and mobile nav toggle.

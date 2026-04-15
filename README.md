# Wright Intelligent Systems Website

A polished, single-page marketing website for Wright Intelligent Systems LLC.

The site highlights services, company background, signature offers, FAQs, and a contact workflow with Formspree integration.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- `serve` (for local static hosting)

## Project Structure

- `index.html` - Main page structure and content
- `styles.css` - Site styling, layout, and visual design
- `scripts.js` - Front-end interactions and animations (navigation, hero effects, FAQ accordion)
- `images/` - Brand and visual assets

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Run locally

```bash
npm run dev
```

The site will be served at [http://localhost:3000](http://localhost:3000).

You can also run:

```bash
npm start
```

## Contact Form Setup

The contact form in `index.html` posts to Formspree:

- Current endpoint: `https://formspree.io/f/xeepyqrb`

To use your own Formspree inbox, replace the `action` URL in the contact form with your form endpoint.

## Customization Notes

- Update business copy in `index.html`
- Adjust colors, spacing, and responsive behavior in `styles.css`
- Modify interactive behavior and animations in `scripts.js`
- Replace logo or imagery in `images/`

## Deployment

Because this is a static website, it can be deployed to platforms like:

- Vercel
- Netlify
- GitHub Pages
- Any static file host or traditional web server

## License

Private project for Wright Intelligent Systems.

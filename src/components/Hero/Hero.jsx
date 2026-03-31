import './Hero.css';

const columnas = [
  {
    letra: 'COL',
    bg: 'linear-gradient(160deg, #0F3A9E 0%, #1A56DB 40%, #0A0F1E 100%)',
  },
  {
    letra: 'OM',
    bg: 'linear-gradient(160deg, #A8240E 0%, #E8341A 40%, #0A0F1E 100%)',
  },
  {
    letra: 'BIA',
    bg: 'linear-gradient(160deg, #B8960A 0%, #F5C800 40%, #0A0F1E 100%)',
  },
];

export default function Hero() {
  return (
    <section className="hero">
      {columnas.map((col) => (
        <div className="hero-col" key={col.letra}>
          <div
            className="hero-col-placeholder"
            style={{ background: col.bg }}
          />
          <div className="hero-col-overlay" />
          <span className="hero-col-letra">{col.letra}</span>
        </div>
      ))}
    </section>
  );
}

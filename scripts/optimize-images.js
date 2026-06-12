import sharp from 'sharp';
import { readdir, mkdir, stat } from 'fs/promises';
import { join, basename, extname } from 'path';

const FOLDERS = [
  { input: 'public/Nuestra Historia',  output: 'public/nuestra-historia' },
  { input: 'public/Escuela de Musica', output: 'public/escuela-musica'   },
  {
    input: 'public/noticias Banner',
    output: 'public/noticias-banners',
    maxWidth: 900,
    quality: 85,
    rename: {
      'Noticia_baner_1.png': 'noticia-banner-gira-usa.webp',
      'Noticia_baner_2.png': 'noticia-banner-escuela.webp',
      'Noticia_baner_3.png': 'noticia-banner-festival.webp',
      'Noticia_baner_4.png': 'noticia-banner-convenio.webp',
      'Noticia_baner_5.png': 'noticia-banner-reconocimiento.webp',
    },
  },
  {
    input: 'public/elenco',
    output: 'public/elenco-opt',
    maxWidth: 800,
    quality: 85,
    rename: {
      'Leonardo.webp': 'elenco-leonardo.webp',
      'Lucia.png':     'elenco-luciana.webp',
      'Trio.png':      'elenco-trio.webp',
      'senior.png':    'elenco-senior.webp',
      'elenco.jpg':    'elenco-juvenil.webp',
      'danza.JPG':     'elenco-danza.webp',
    },
  },
  {
    input: 'public/eventos_imagenes',
    output: 'public/eventos-imagenes',
    maxWidth: 1200,
    quality: 85,
    rename: {
      'Evento_1.png': 'evento-bambucos-disney.webp',
      'Evento_2.png': 'evento-gira-miami.webp',
      'Evento_3.png': 'evento-herencia-andina.webp',
      'Evento_4.png': 'evento-festival-nacional.webp',
      'Evento_5.png': 'evento-melodias-piano.webp',
    },
  },
  {
    input: 'public/iconos noticias',
    output: 'public/iconos-noticias',
    maxWidth: 200,
    quality: 88,
    rename: {
      'Gemini_Generated_Image_5d8ipx5d8ipx5d8i.png': 'noticia-reconocimiento.webp',
      'Gemini_Generated_Image_5k78ly5k78ly5k78.png': 'noticia-festival-nacional.webp',
      'Gemini_Generated_Image_827s0z827s0z827s.png':  'noticia-escuela-temporada.webp',
      'Gemini_Generated_Image_c6xj7sc6xj7sc6xj.png': 'noticia-convenio-cultura.webp',
      'Gemini_Generated_Image_w7wvn3w7wvn3w7wv.png':  'noticia-gira-usa.webp',
    },
  },
  {
    input: 'public/Testimonio_retrato',
    output: 'public/testimonios-retratos',
    maxWidth: 400,
    quality: 88,
    fit: 'cover',
    rename: {
      'Maria.png':    'testimonio-maria-fernanda.webp',
      'Luis.png':     'testimonio-luis-armando.webp',
      'Sandra.png':   'testimonio-sandra-milena.webp',
      'Sebastian.png':'testimonio-sebastian-torres.webp',
    },
  },
  {
    input: 'public/logos_aliados',
    output: 'public/aliados',
    maxWidth: 320,
    quality: 90,
    fit: 'inside',
    rename: {
      'Cocrea_logo (2).png':                                               'aliado-cocrea.webp',
      'Comfama_logo (1).png':                                              'aliado-comfama.webp',
      'Escudo_de_Medellín__versión_Alcaldía___1_-removebg-preview.png':    'aliado-alcaldia.webp',
      'MinCul_logo.png':                                                   'aliado-mincultural.webp',
    },
  },
  {
    input: 'public/pestaña_nosotros/nuestra_historia_seccion',
    output: 'public/nosotros-historia',
    maxWidth: 1400,
    quality: 82,
    fit: 'inside',
    rename: {
      'IMG_3775.JPG.jpeg': 'nosotros-historia-disney.webp',
      'img_5966-3.webp':   'nosotros-historia-festival.webp',
      'IMG_2945.JPG':      'nosotros-historia-quienes-somos.webp',
    },
  },
  {
    input: 'public/pestaña_nosotros/fundadora_img',
    output: 'public/nosotros-fundadora',
    maxWidth: 1000,
    quality: 85,
    fit: 'inside',
    rename: {
      'DSC_5059-2 (1).jpg':              'fundadora-retrato.webp',
      'silvia-zapata_foto.jpg':          'fundadora-guitarra.webp',
      'Sra Silvia Zapata . Fundadora.jpg': 'fundadora-escenario.webp',
    },
  },
  {
    input: 'public/pestaña_contacto',
    output: 'public/contacto',
    maxWidth: 280,
    quality: 90,
    fit: 'inside',
    rename: {
      'Copia de FOTO PERFIL-04 (1).png': 'contacto-corazon-estrella.webp',
    },
  },
];
const MAX_WIDTH = 1400;
const WEBP_QUALITY = 82;

for (const folder of FOLDERS) {
  const { input, output } = folder;
  await mkdir(output, { recursive: true });

  let files;
  try {
    files = (await readdir(input)).filter(f =>
      ['.jpg', '.jpeg', '.png', '.webp'].includes(extname(f).toLowerCase())
    );
  } catch {
    console.log(`\n⚠ ${input} no encontrada, saltando.`);
    continue;
  }

  console.log(`\n📁 ${input} (${files.length} imágenes)`);

  for (const file of files) {
    const inputPath = join(input, file);
    const outName = folder.rename?.[file]
      ?? (basename(file, extname(file))
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[()]/g, '')
          + '.webp');
    const outputPath = join(output, outName);

    const { size: inSize } = await stat(inputPath);
    const meta = await sharp(inputPath).metadata();
    const folderMaxWidth = folder.maxWidth ?? MAX_WIDTH;
    const folderQuality  = folder.quality  ?? WEBP_QUALITY;
    const folderFit      = folder.fit      ?? 'cover';

    await sharp(inputPath)
      .resize({ width: folderMaxWidth, height: folderMaxWidth, fit: folderFit, withoutEnlargement: true })
      .webp({ quality: folderQuality })
      .toFile(outputPath);

    const { size: outSize } = await stat(outputPath);
    const reduction = (((inSize - outSize) / inSize) * 100).toFixed(0);

    console.log(`  ✓ ${file}`);
    console.log(`    ${meta.width}x${meta.height} → máx ${MAX_WIDTH}px | ${(inSize/1024/1024).toFixed(1)}MB → ${(outSize/1024).toFixed(0)}KB (-${reduction}%)`);
  }
}

console.log('\nListo.');

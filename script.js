document.addEventListener('DOMContentLoaded', () => {

  const formScreen   = document.getElementById('formScreen');
  const certScreen   = document.getElementById('certScreen');
  const certForm     = document.getElementById('certForm');
  const studentInput = document.getElementById('studentName');
  const trackInput   = document.getElementById('trackName');

  const certName  = document.getElementById('certName');
  const certTrack = document.getElementById('certTrack');
  const certDate  = document.getElementById('certDate');
  const certificate = document.getElementById('certificate');

  const editBtn     = document.getElementById('editBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  function todayString(){
    const d = new Date();
    return d.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  }

  certForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name  = studentInput.value.trim();
    const track = trackInput.value.trim();

    if(!name || !track){
      studentInput.reportValidity();
      trackInput.reportValidity();
      return;
    }

    certName.textContent  = name;
    certTrack.textContent = track;
    certDate.textContent  = todayString();

    formScreen.hidden = true;
    certScreen.hidden = false;
    window.scrollTo({ top:0, behavior:'instant' });
  });

  editBtn.addEventListener('click', () => {
    certScreen.hidden = true;
    formScreen.hidden = false;
  });

  downloadBtn.addEventListener('click', async () => {
    const originalLabel = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<span>Preparing...</span>';
    downloadBtn.style.pointerEvents = 'none';

    try{
      // make sure webfonts are fully loaded before rasterizing
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      certificate.classList.add('exporting');

      const canvas = await html2canvas(certificate, {
        scale: 3,
        backgroundColor: '#101b23',
        useCORS: true,
        logging: false
      });

      certificate.classList.remove('exporting');

      const imgData = canvas.toDataURL('image/png', 1.0);

      const pageW = canvas.width;
      const pageH = canvas.height;

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [pageW, pageH],
        compress: true
      });

      // fill the whole page with the certificate's own background first,
      // so any sub-pixel rounding gap never shows up as a white sliver
      pdf.setFillColor(16, 27, 35);
      pdf.rect(0, 0, pageW, pageH, 'F');

      // draw the image very slightly oversized (by ~1px on each edge) so it
      // fully covers the page with no gap at the borders
      pdf.addImage(imgData, 'PNG', -0.5, -0.5, pageW + 1, pageH + 1);

      const nameForFile = (studentInput.value.trim() || 'certificate').replace(/\s+/g, '_');
      pdf.save(`VOLTIX_Certificate_${nameForFile}.pdf`);

    }catch(err){
      console.error('PDF export failed:', err);
      alert('Something went wrong while creating the PDF. Please try again.');
    }finally{
      downloadBtn.innerHTML = originalLabel;
      downloadBtn.style.pointerEvents = 'auto';
    }
  });

});
// ========================================================

const viewport_geometry = () => {

  const viewport_width = window.innerWidth;
  const viewport_height = window.innerHeight;
  const viewport_center_x = viewport_width / 2;
  const viewport_center_y = viewport_height / 2;

  const document_height1 = document.documentElement.offsetHeight;
  const document_height2 = document.documentElement.getBoundingClientRect().height;
  const scroll_offset = window.scrollY;

  return {viewport_center_x, viewport_center_y, viewport_width, viewport_height};
};

// ========================================================

const element_geometry = (elem) => {

  const geometry = elem.getBoundingClientRect(); 
  // console.log('square_geometry: ', square_geometry);
  
  // (x1, y1) -----------------------|
  //    |                            |
  //    |                            |
  //    |----------(x0, y0)----------|
  //    |                            |
  //    |                            |
  //    |-------------------------(x2, y2)


  const w = geometry.width;
  const h = geometry.height;
  const x1 = geometry.left;
  const y1 = geometry.top;
  const x2 = geometry.right;
  const y2 = geometry.bottom;
  const x0 = x1 + w/2;
  const y0 = y1 + h/2;

  return {x0, y0, x1, y1, x2, y2, w, h};
};

// ========================================================

const get_center_shifts = (viewport_center_x, viewport_center_y, x0, y0) => {
  let shift_x, shift_y;

  if (viewport_center_x > x0)
    shift_x = viewport_center_x - x0;
  else
    shift_x = -(x0 - viewport_center_x);

  if (viewport_center_y > y0)
    shift_y = viewport_center_y - y0;
  else
    shift_y = -(y0 - viewport_center_y);

  return {shift_x, shift_y};
};

// ========================================================

export {viewport_geometry, element_geometry, get_center_shifts};

// ========================================================
import * as React from 'react';

const StatusLoading = <svg
  width="12em"
  viewBox="0 0 500 100"
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  xmlnsXlink="http://www.w3.org/1999/xlink"
  xmlSpace="preserve"
  style={{ fillRule: "evenodd", clipRule: "evenodd", strokeLinejoin: "round", strokeMiterlimit: 2, marginBottom: "1em", overflow: "visible" }}>
  <text x="0px" y="100px" style={{ fontStyle: "italic", fontSize: "96px", fill: "#06f" }}>Loading</text>
  <path d="M430,0c0,0 -10,21 -10,30c0,5.519 4.481,10 10,10c5.519,0 10,-4.481 10,-10c0,-9 -10,-30 -10,-30Z" style={{ fill: "#fcf" }} /><path d="M450,100c0,0 -10,-21 -10,-30c0,-5.519 4.481,-10 10,-10c5.519,0 10,4.481 10,10c0,9 -10,30 -10,30Z" style={{ fill: "#fcf" }} />
  <path d="M260,27.99c0,0 21,10 30,10c5.519,0 10,-4.48 10,-10c0,-5.519 -4.481,-10 -10,-10c-9,0 -30,10 -30,10Z" style={{ fill: "#fcf" }} />
  <path d="M500,50c0,0 -21,-10 -30,-10c-5.519,0 -10,4.481 -10,10c0,5.519 4.481,10 10,10c9,0 30,-10 30,-10Z" style={{ fill: "#fcf" }} />
  <path d="M475,6.699c0,0 -19.16,13.186 -23.66,20.98c-2.76,4.78 -1.12,10.901 3.66,13.661c4.78,2.759 10.901,1.119 13.66,-3.661c4.5,-7.794 6.34,-30.98 6.34,-30.98Z" style={{ fill: "#fcf" }} />
  <path d="M390,90c0,0 1.84,-23.187 6.34,-30.981c2.759,-4.779 8.88,-6.42 13.66,-3.66c4.78,2.76 6.42,8.881 3.66,13.66c-4.5,7.794 -23.66,20.981 -23.66,20.981Z" style={{ fill: "#fcf" }} />
  <path d="M124.019,7.5c0,0 13.187,19.16 20.981,23.66c4.78,2.76 10.901,1.12 13.66,-3.66c2.76,-4.78 1.12,-10.901 -3.66,-13.66c-7.794,-4.5 -30.981,-6.34 -30.981,-6.34Z" style={{ fill: "#fcf" }} />
  <path d="M493.301,75c0,0 -13.186,-19.16 -20.98,-23.66c-4.78,-2.76 -10.901,-1.12 -13.661,3.66c-2.759,4.78 -1.119,10.901 3.661,13.66c7.794,4.5 30.98,6.34 30.98,6.34Z" style={{ fill: "#fcf" }} />
  <path d="M364.019,2.01c0,0 1.84,23.186 6.34,30.98c2.759,4.78 8.88,6.42 13.66,3.661c4.78,-2.76 6.42,-8.881 3.66,-13.661c-4.5,-7.794 -23.66,-20.98 -23.66,-20.98Z" style={{ fill: "#fcf" }} />
  <path d="M475,93.301c0,0 -19.16,-13.186 -23.66,-20.98c-2.76,-4.78 -1.12,-10.901 3.66,-13.661c4.78,-2.759 10.901,-1.119 13.66,3.661c4.5,7.794 6.34,30.98 6.34,30.98Z" style={{ fill: "#fcf" }} />
  <path d="M342.01,85c0,0 23.186,-1.84 30.98,-6.34c4.78,-2.759 6.42,-8.88 3.661,-13.66c-2.76,-4.78 -8.881,-6.42 -13.661,-3.66c-7.794,4.5 -20.98,23.66 -20.98,23.66Z" style={{ fill: "#fcf" }} />
  <path d="M493.301,25c0,0 -23.186,1.84 -30.98,6.34c-4.78,2.759 -6.42,8.88 -3.661,13.66c2.76,4.78 8.881,6.42 13.661,3.66c7.794,-4.5 20.98,-23.66 20.98,-23.66Z" style={{ fill: "#fcf" }} />
  <path d="M478.284,21.716c0,0 -16.97,2.828 -21.213,7.071c-3.903,3.902 -3.903,10.239 0,14.142c3.903,3.903 10.24,3.903 14.142,0c4.243,-4.243 7.071,-21.213 7.071,-21.213Z" style={{ fill: "#f6f" }} />
  <path d="M370,100c0,0 2.828,-16.971 7.071,-21.213c3.903,-3.903 10.24,-3.903 14.142,0c3.903,3.902 3.903,10.239 0,14.142c-4.242,4.243 -21.213,7.071 -21.213,7.071Z" style={{ fill: "#f6f" }} />
  <path d="M385.43,15.86c0,0 16.97,2.828 21.213,7.071c3.903,3.903 3.903,10.239 0,14.142c-3.903,3.903 -10.239,3.903 -14.142,0c-4.243,-4.243 -7.071,-21.213 -7.071,-21.213Z" style={{ fill: "#f6f" }} />
  <path d="M478.284,78.284c0,0 -2.828,-16.97 -7.071,-21.213c-3.902,-3.903 -10.239,-3.903 -14.142,0c-3.903,3.903 -3.903,10.24 0,14.142c4.243,4.243 21.213,7.071 21.213,7.071Z" style={{ fill: "#f6f" }} />
  <path d="M488.637,39.647c0,0 -16.111,-6.036 -21.907,-4.483c-5.331,1.429 -8.499,6.917 -7.071,12.248c1.429,5.331 6.917,8.499 12.248,7.071c5.795,-1.553 16.73,-14.836 16.73,-14.836Z" style={{ fill: "#f6f" }} />
  <path d="M165.34,33.15c0,0 10.935,-13.283 16.73,-14.836c5.331,-1.428 10.819,1.74 12.248,7.071c1.428,5.331 -1.74,10.819 -7.072,12.248c-5.795,1.553 -21.906,-4.483 -21.906,-4.483Z" style={{ fill: "#f6f" }} />
  <path d="M354.822,5.34c0,0 13.282,10.935 14.835,16.73c1.429,5.331 -1.74,10.819 -7.071,12.248c-5.331,1.428 -10.819,-1.74 -12.247,-7.072c-1.553,-5.795 4.483,-21.906 4.483,-21.906Z" style={{ fill: "#f6f" }} />
  <path d="M460.353,88.637c0,0 6.036,-16.111 4.483,-21.907c-1.429,-5.331 -6.917,-8.499 -12.248,-7.071c-5.331,1.429 -8.499,6.917 -7.071,12.248c1.553,5.795 14.836,16.73 14.836,16.73Z" style={{ fill: "#f6f" }} />
  <path d="M460.353,11.363c0,0 -13.283,10.935 -14.836,16.73c-1.428,5.331 1.74,10.819 7.071,12.248c5.331,1.428 10.819,-1.74 12.248,-7.071c1.553,-5.796 -4.483,-21.907 -4.483,-21.907Z" style={{ fill: "#f6f" }} />
  <path d="M415.093,94.66c0,0 -6.036,-16.111 -4.483,-21.906c1.429,-5.332 6.917,-8.5 12.248,-7.072c5.331,1.429 8.499,6.917 7.071,12.248c-1.553,5.795 -14.836,16.73 -14.836,16.73Z" style={{ fill: "#f6f" }} />
  <path d="M310,12.752c0,0 16.111,-6.036 21.907,-4.483c5.331,1.428 8.499,6.916 7.071,12.247c-1.429,5.331 -6.917,8.5 -12.248,7.071c-5.795,-1.553 -16.73,-14.835 -16.73,-14.835Z" style={{ fill: "#f6f" }} />
  <path d="M488.637,60.353c0,0 -10.935,-13.283 -16.73,-14.836c-5.331,-1.428 -10.819,1.74 -12.248,7.071c-1.428,5.331 1.74,10.819 7.071,12.248c5.796,1.553 21.907,-4.483 21.907,-4.483Z" style={{ fill: "#f6f" }} />
  <path d="M480,50c0,0 -11.2,-4 -16,-4c-2.208,0 -4,1.792 -4,4c0,2.208 1.792,4 4,4c4.8,0 16,-4 16,-4Z" style={{ fill: "#f0f" }} />
  <path d="M360,41.888c0,0 11.2,-4 16,-4c2.208,0 4,1.793 4,4c0,2.208 -1.792,4 -4,4c-4.8,0 -16,-4 -16,-4Z" style={{ fill: "#f0f" }} />
  <path d="M450,20c0,0 4,15.4 4,22c0,2.208 -1.792,4 -4,4c-2.208,0 -4,-1.792 -4,-4c0,-6.6 4,-22 4,-22Z" style={{ fill: "#f0f" }} />
  <path d="M450,80c0,0 4,-11.2 4,-16c0,-2.208 -1.792,-4 -4,-4c-2.208,0 -4,1.792 -4,4c0,4.8 4,16 4,16Z" style={{ fill: "#f0f" }} />
  <path d="M475.981,35c0,0 -11.7,2.136 -15.857,4.536c-1.912,1.104 -2.568,3.552 -1.464,5.464c1.104,1.912 3.552,2.568 5.464,1.464c4.157,-2.4 11.857,-11.464 11.857,-11.464Z" style={{ fill: "#f0f" }} />
  <path d="M372.144,72c0,0 7.699,-9.064 11.856,-11.464c1.912,-1.104 4.36,-0.448 5.464,1.464c1.104,1.912 0.448,4.36 -1.464,5.464c-4.157,2.4 -15.856,4.536 -15.856,4.536Z" style={{ fill: "#f0f" }} />
  <path d="M392.5,4.334c0,0 11.164,11.336 14.464,17.052c1.104,1.912 0.448,4.36 -1.464,5.464c-1.912,1.104 -4.36,0.448 -5.464,-1.464c-3.3,-5.716 -7.536,-21.052 -7.536,-21.052Z" style={{ fill: "#f0f" }} />
  <path d="M465,75.981c0,0 -2.136,-11.7 -4.536,-15.857c-1.104,-1.912 -3.552,-2.568 -5.464,-1.464c-1.912,1.104 -2.568,3.552 -1.464,5.464c2.4,4.157 11.464,11.857 11.464,11.857Z" style={{ fill: "#f0f" }} />
  <path d="M475.981,65c0,0 -7.7,-9.064 -11.857,-11.464c-1.912,-1.104 -4.36,-0.448 -5.464,1.464c-1.104,1.912 -0.448,4.36 1.464,5.464c4.157,2.4 15.857,4.536 15.857,4.536Z" style={{ fill: "#f0f" }} />
  <path d="M352.144,15.386c0,0 11.699,2.136 15.856,4.536c1.912,1.104 2.568,3.552 1.464,5.464c-1.104,1.912 -3.552,2.568 -5.464,1.464c-4.157,-2.4 -11.856,-11.464 -11.856,-11.464Z" style={{ fill: "#f0f" }} />
  <path d="M465,24.019c0,0 -4.236,15.337 -7.536,21.053c-1.104,1.912 -3.552,2.568 -5.464,1.464c-1.912,-1.104 -2.568,-3.552 -1.464,-5.464c3.3,-5.716 14.464,-17.053 14.464,-17.053Z" style={{ fill: "#f0f" }} />
  <path d="M404,94.66c0,0 9.064,-7.699 11.464,-11.856c1.104,-1.912 0.448,-4.36 -1.464,-5.464c-1.912,-1.104 -4.36,-0.448 -5.464,1.464c-2.4,4.157 -4.536,15.856 -4.536,15.856Z" style={{ fill: "#f0f" }} />
  <path d="M462.708,65.444c0.998,-0.822 1.914,-1.738 2.736,-2.736l-1.743,-2.644c0.738,-1.005 1.364,-2.089 1.865,-3.231l3.161,0.187c0.454,-1.21 0.789,-2.461 1.002,-3.736l-2.832,-1.419c0.137,-1.239 0.137,-2.491 0,-3.73l2.832,-1.419c-0.213,-1.275 -0.548,-2.526 -1.002,-3.736l-3.161,0.187c-0.501,-1.142 -1.127,-2.226 -1.865,-3.231l1.743,-2.644c-0.822,-0.998 -1.738,-1.914 -2.736,-2.736l-2.644,1.743c-1.005,-0.738 -2.089,-1.364 -3.231,-1.865l0.187,-3.161c-1.21,-0.454 -2.461,-0.789 -3.736,-1.002l-1.419,2.832c-1.239,-0.137 -2.491,-0.137 -3.73,0l-1.419,-2.832c-1.275,0.213 -2.526,0.548 -3.736,1.002l0.187,3.161c-1.142,0.501 -2.226,1.127 -3.231,1.865l-2.644,-1.743c-0.998,0.822 -1.914,1.738 -2.736,2.736l1.743,2.644c-0.738,1.005 -1.364,2.089 -1.865,3.231l-3.161,-0.187c-0.454,1.21 -0.789,2.461 -1.002,3.736l2.832,1.419c-0.137,1.239 -0.137,2.491 0,3.73l-2.832,1.419c0.213,1.275 0.548,2.526 1.002,3.736l3.161,-0.187c0.501,1.142 1.127,2.226 1.865,3.231l-1.743,2.644c0.822,0.998 1.738,1.914 2.736,2.736l2.644,-1.743c1.005,0.738 2.089,1.364 3.231,1.865l-0.187,3.161c1.21,0.454 2.461,0.789 3.736,1.002l1.419,-2.832c1.239,0.137 2.491,0.137 3.73,0l1.419,2.832c1.275,-0.213 2.526,-0.548 3.736,-1.002l-0.187,-3.161c1.142,-0.501 2.226,-1.127 3.231,-1.865l2.644,1.743Zm-9.88,-12.616c-1.561,1.561 -4.095,1.561 -5.656,0c-1.561,-1.561 -1.561,-4.095 0,-5.656c1.561,-1.561 4.095,-1.561 5.656,0c1.561,1.561 1.561,4.095 0,5.656Z" style={{ fill: "#ff4" }} />
</svg>;

const StatusReady = <svg
  width="12em"
  viewBox="0 0 500 100"
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  xmlnsXlink="http://www.w3.org/1999/xlink"
  xmlSpace="preserve"
  style={{ fillRule: "evenodd", clipRule: "evenodd", strokeLinejoin: "round", strokeMiterlimit: 2, marginBottom: "1em", overflow: "visible" }}>
  <text x="0px" y="100px" style={{ fontStyle: "italic", fontSize: "96px", fill: "#06f" }}>Ready!</text>
  <path d="M450,0c0,0 -10,21 -10,30c0,5.519 4.481,10 10,10c5.519,0 10,-4.481 10,-10c0,-9 -10,-30 -10,-30Z" style={{ fill: "#fcf" }} />
  <path d="M450,100c0,0 -10,-21 -10,-30c0,-5.519 4.481,-10 10,-10c5.519,0 10,4.481 10,10c0,9 -10,30 -10,30Z" style={{ fill: "#fcf" }} />
  <path d="M400,50c0,0 21,10 30,10c5.519,0 10,-4.481 10,-10c0,-5.519 -4.481,-10 -10,-10c-9,0 -30,10 -30,10Z" style={{ fill: "#fcf" }} />
  <path d="M500,50c0,0 -21,-10 -30,-10c-5.519,0 -10,4.481 -10,10c0,5.519 4.481,10 10,10c9,0 30,-10 30,-10Z" style={{ fill: "#fcf" }} />
  <path d="M475,6.699c0,0 -19.16,13.186 -23.66,20.98c-2.76,4.78 -1.12,10.901 3.66,13.661c4.78,2.759 10.901,1.119 13.66,-3.661c4.5,-7.794 6.34,-30.98 6.34,-30.98Z" style={{ fill: "#fcf" }} />
  <path d="M425,93.301c0,0 1.84,-23.186 6.34,-30.98c2.759,-4.78 8.88,-6.42 13.66,-3.661c4.78,2.76 6.42,8.881 3.66,13.661c-4.5,7.794 -23.66,20.98 -23.66,20.98Z" style={{ fill: "#fcf" }} />
  <path d="M406.699,25c0,0 13.186,19.16 20.98,23.66c4.78,2.76 10.901,1.12 13.661,-3.66c2.759,-4.78 1.119,-10.901 -3.661,-13.66c-7.794,-4.5 -30.98,-6.34 -30.98,-6.34Z" style={{ fill: "#fcf" }} />
  <path d="M493.301,75c0,0 -13.186,-19.16 -20.98,-23.66c-4.78,-2.76 -10.901,-1.12 -13.661,3.66c-2.759,4.78 -1.119,10.901 3.661,13.66c7.794,4.5 30.98,6.34 30.98,6.34Z" style={{ fill: "#fcf" }} />
  <path d="M425,6.699c0,0 1.84,23.186 6.34,30.98c2.759,4.78 8.88,6.42 13.66,3.661c4.78,-2.76 6.42,-8.881 3.66,-13.661c-4.5,-7.794 -23.66,-20.98 -23.66,-20.98Z" style={{ fill: "#fcf" }} />
  <path d="M475,93.301c0,0 -19.16,-13.186 -23.66,-20.98c-2.76,-4.78 -1.12,-10.901 3.66,-13.661c4.78,-2.759 10.901,-1.119 13.66,3.661c4.5,7.794 6.34,30.98 6.34,30.98Z" style={{ fill: "#fcf" }} />
  <path d="M406.699,75c0,0 23.186,-1.84 30.98,-6.34c4.78,-2.759 6.42,-8.88 3.661,-13.66c-2.76,-4.78 -8.881,-6.42 -13.661,-3.66c-7.794,4.5 -20.98,23.66 -20.98,23.66Z" style={{ fill: "#fcf" }} />
  <path d="M493.301,25c0,0 -23.186,1.84 -30.98,6.34c-4.78,2.759 -6.42,8.88 -3.661,13.66c2.76,4.78 8.881,6.42 13.661,3.66c7.794,-4.5 20.98,-23.66 20.98,-23.66Z" style={{ fill: "#fcf" }} />
  <path d="M478.284,21.716c0,0 -16.97,2.828 -21.213,7.071c-3.903,3.902 -3.903,10.239 0,14.142c3.903,3.903 10.24,3.903 14.142,0c4.243,-4.243 7.071,-21.213 7.071,-21.213Z" style={{ fill: "#f6f" }} />
  <path d="M421.716,78.284c0,0 2.828,-16.97 7.071,-21.213c3.902,-3.903 10.239,-3.903 14.142,0c3.903,3.903 3.903,10.24 0,14.142c-4.243,4.243 -21.213,7.071 -21.213,7.071Z" style={{ fill: "#f6f" }} />
  <path d="M421.716,21.716c0,0 16.97,2.828 21.213,7.071c3.903,3.902 3.903,10.239 0,14.142c-3.903,3.903 -10.24,3.903 -14.142,0c-4.243,-4.243 -7.071,-21.213 -7.071,-21.213Z" style={{ fill: "#f6f" }} />
  <path d="M478.284,78.284c0,0 -2.828,-16.97 -7.071,-21.213c-3.902,-3.903 -10.239,-3.903 -14.142,0c-3.903,3.903 -3.903,10.24 0,14.142c4.243,4.243 21.213,7.071 21.213,7.071Z" style={{ fill: "#f6f" }} />
  <path d="M488.637,39.647c0,0 -16.111,-6.036 -21.907,-4.483c-5.331,1.429 -8.499,6.917 -7.071,12.248c1.429,5.331 6.917,8.499 12.248,7.071c5.795,-1.553 16.73,-14.836 16.73,-14.836Z" style={{ fill: "#f6f" }} />
  <path d="M411.363,60.353c0,0 10.935,-13.283 16.73,-14.836c5.331,-1.428 10.819,1.74 12.248,7.071c1.428,5.331 -1.74,10.819 -7.071,12.248c-5.796,1.553 -21.907,-4.483 -21.907,-4.483Z" style={{ fill: "#f6f" }} />
  <path d="M439.647,11.363c0,0 13.283,10.935 14.836,16.73c1.428,5.331 -1.74,10.819 -7.071,12.248c-5.331,1.428 -10.819,-1.74 -12.248,-7.071c-1.553,-5.796 4.483,-21.907 4.483,-21.907Z" style={{ fill: "#f6f" }} />
  <path d="M460.353,88.637c0,0 6.036,-16.111 4.483,-21.907c-1.429,-5.331 -6.917,-8.499 -12.248,-7.071c-5.331,1.429 -8.499,6.917 -7.071,12.248c1.553,5.795 14.836,16.73 14.836,16.73Z" style={{ fill: "#f6f" }} />
  <path d="M460.353,11.363c0,0 -13.283,10.935 -14.836,16.73c-1.428,5.331 1.74,10.819 7.071,12.248c5.331,1.428 10.819,-1.74 12.248,-7.071c1.553,-5.796 -4.483,-21.907 -4.483,-21.907Z" style={{ fill: "#f6f" }} />
  <path d="M439.647,88.637c0,0 -6.036,-16.111 -4.483,-21.907c1.429,-5.331 6.917,-8.499 12.248,-7.071c5.331,1.429 8.499,6.917 7.071,12.248c-1.553,5.795 -14.836,16.73 -14.836,16.73Z" style={{ fill: "#f6f" }} />
  <path d="M411.363,39.647c0,0 16.111,-6.036 21.907,-4.483c5.331,1.429 8.499,6.917 7.071,12.248c-1.429,5.331 -6.917,8.499 -12.248,7.071c-5.795,-1.553 -16.73,-14.836 -16.73,-14.836Z" style={{ fill: "#f6f" }} />
  <path d="M488.637,60.353c0,0 -10.935,-13.283 -16.73,-14.836c-5.331,-1.428 -10.819,1.74 -12.248,7.071c-1.428,5.331 1.74,10.819 7.071,12.248c5.796,1.553 21.907,-4.483 21.907,-4.483Z" style={{ fill: "#f6f" }} />
  <path d="M480,50c0,0 -11.2,-4 -16,-4c-2.208,0 -4,1.792 -4,4c0,2.208 1.792,4 4,4c4.8,0 16,-4 16,-4Z" style={{ fill: "#f0f" }} />
  <path d="M420,50c0,0 11.2,-4 16,-4c2.208,0 4,1.792 4,4c0,2.208 -1.792,4 -4,4c-4.8,0 -16,-4 -16,-4Z" style={{ fill: "#f0f" }} />
  <path d="M450,20c0,0 4,15.4 4,22c0,2.208 -1.792,4 -4,4c-2.208,0 -4,-1.792 -4,-4c0,-6.6 4,-22 4,-22Z" style={{ fill: "#f0f" }} />
  <path d="M450,80c0,0 4,-11.2 4,-16c0,-2.208 -1.792,-4 -4,-4c-2.208,0 -4,1.792 -4,4c0,4.8 4,16 4,16Z" style={{ fill: "#f0f" }} />
  <path d="M475.981,35c0,0 -11.7,2.136 -15.857,4.536c-1.912,1.104 -2.568,3.552 -1.464,5.464c1.104,1.912 3.552,2.568 5.464,1.464c4.157,-2.4 11.857,-11.464 11.857,-11.464Z" style={{ fill: "#f0f" }} />
  <path d="M424.019,65c0,0 7.7,-9.064 11.857,-11.464c1.912,-1.104 4.36,-0.448 5.464,1.464c1.104,1.912 0.448,4.36 -1.464,5.464c-4.157,2.4 -15.857,4.536 -15.857,4.536Z" style={{ fill: "#f0f" }} />
  <path d="M435,24.019c0,0 11.164,11.337 14.464,17.053c1.104,1.912 0.448,4.36 -1.464,5.464c-1.912,1.104 -4.36,0.448 -5.464,-1.464c-3.3,-5.716 -7.536,-21.053 -7.536,-21.053Z" style={{ fill: "#f0f" }} />
  <path d="M465,75.981c0,0 -2.136,-11.7 -4.536,-15.857c-1.104,-1.912 -3.552,-2.568 -5.464,-1.464c-1.912,1.104 -2.568,3.552 -1.464,5.464c2.4,4.157 11.464,11.857 11.464,11.857Z" style={{ fill: "#f0f" }} />
  <path d="M475.981,65c0,0 -7.7,-9.064 -11.857,-11.464c-1.912,-1.104 -4.36,-0.448 -5.464,1.464c-1.104,1.912 -0.448,4.36 1.464,5.464c4.157,2.4 15.857,4.536 15.857,4.536Z" style={{ fill: "#f0f" }} />
  <path d="M424.019,35c0,0 11.7,2.136 15.857,4.536c1.912,1.104 2.568,3.552 1.464,5.464c-1.104,1.912 -3.552,2.568 -5.464,1.464c-4.157,-2.4 -11.857,-11.464 -11.857,-11.464Z" style={{ fill: "#f0f" }} />
  <path d="M465,24.019c0,0 -4.236,15.337 -7.536,21.053c-1.104,1.912 -3.552,2.568 -5.464,1.464c-1.912,-1.104 -2.568,-3.552 -1.464,-5.464c3.3,-5.716 14.464,-17.053 14.464,-17.053Z" style={{ fill: "#f0f" }} />
  <path d="M435,75.981c0,0 9.064,-7.7 11.464,-11.857c1.104,-1.912 0.448,-4.36 -1.464,-5.464c-1.912,-1.104 -4.36,-0.448 -5.464,1.464c-2.4,4.157 -4.536,15.857 -4.536,15.857Z" style={{ fill: "#f0f" }} />
  <path d="M462.708,65.444c0.998,-0.822 1.914,-1.738 2.736,-2.736l-1.743,-2.644c0.738,-1.005 1.364,-2.089 1.865,-3.231l3.161,0.187c0.454,-1.21 0.789,-2.461 1.002,-3.736l-2.832,-1.419c0.137,-1.239 0.137,-2.491 0,-3.73l2.832,-1.419c-0.213,-1.275 -0.548,-2.526 -1.002,-3.736l-3.161,0.187c-0.501,-1.142 -1.127,-2.226 -1.865,-3.231l1.743,-2.644c-0.822,-0.998 -1.738,-1.914 -2.736,-2.736l-2.644,1.743c-1.005,-0.738 -2.089,-1.364 -3.231,-1.865l0.187,-3.161c-1.21,-0.454 -2.461,-0.789 -3.736,-1.002l-1.419,2.832c-1.239,-0.137 -2.491,-0.137 -3.73,0l-1.419,-2.832c-1.275,0.213 -2.526,0.548 -3.736,1.002l0.187,3.161c-1.142,0.501 -2.226,1.127 -3.231,1.865l-2.644,-1.743c-0.998,0.822 -1.914,1.738 -2.736,2.736l1.743,2.644c-0.738,1.005 -1.364,2.089 -1.865,3.231l-3.161,-0.187c-0.454,1.21 -0.789,2.461 -1.002,3.736l2.832,1.419c-0.137,1.239 -0.137,2.491 0,3.73l-2.832,1.419c0.213,1.275 0.548,2.526 1.002,3.736l3.161,-0.187c0.501,1.142 1.127,2.226 1.865,3.231l-1.743,2.644c0.822,0.998 1.738,1.914 2.736,2.736l2.644,-1.743c1.005,0.738 2.089,1.364 3.231,1.865l-0.187,3.161c1.21,0.454 2.461,0.789 3.736,1.002l1.419,-2.832c1.239,0.137 2.491,0.137 3.73,0l1.419,2.832c1.275,-0.213 2.526,-0.548 3.736,-1.002l-0.187,-3.161c1.142,-0.501 2.226,-1.127 3.231,-1.865l2.644,1.743Zm-9.88,-12.616c-1.561,1.561 -4.095,1.561 -5.656,0c-1.561,-1.561 -1.561,-4.095 0,-5.656c1.561,-1.561 4.095,-1.561 5.656,0c1.561,1.561 1.561,4.095 0,5.656Z" style={{ fill: "#ff4" }} />
</svg>;

export { StatusLoading, StatusReady }

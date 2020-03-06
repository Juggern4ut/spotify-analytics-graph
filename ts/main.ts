window.onload = () => {
  window["graph"] = new Graph();
  const stress = document.getElementById("stress") as HTMLInputElement
  stress.onchange = () => {
    if(stress.checked){
      window["graph"].dropFps = true;
    }else{
      window["graph"].dropFps = false;
    }
  }
};

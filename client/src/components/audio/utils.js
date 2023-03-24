import WaveSurfer from "wavesurfer.js";
import CursorPlugin from "wavesurfer.js/dist/plugin/wavesurfer.cursor";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions";
import MarkersPlugin from "wavesurfer.js/dist/plugin/wavesurfer.markers";

export default function createWavesurfer(){
    return WaveSurfer.create({
            container: `#audioplayer`,
            waveColor: "#29d9ce",
            progressColor: "#efda9d",
            height: 150,
            maxPxPerSec: 1000,
            cursorWidth: 1,
            cursorColor: "lightgray",
            normalize: true,
            responsive: true,
            fillParent: true,
            splitChannels: true,
            plugins: [
                CursorPlugin.create({
                    container: '#audioplayer',
                    color: 'red',
                    showTime: true,
                    opacity: 0.9,
                }),
                TimelinePlugin.create({
                    container: '#audioplayer_tl'
                }),
                RegionsPlugin.create({maxRegions: 1}),
                MarkersPlugin.create(),
            ]
        });
}
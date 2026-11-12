const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

function point(points, t) {
    const u = 1 - t;
    return {
        x: u ** 3 * points[0][0] + 3 * u * u * t * points[1][0] + 3 * u * t * t * points[2][0] + t ** 3 * points[3][0],
        z: u ** 3 * points[0][1] + 3 * u * u * t * points[1][1] + 3 * u * t * t * points[2][1] + t ** 3 * points[3][1],
        dx: 3 * u * u * (points[1][0] - points[0][0]) + 6 * u * t * (points[2][0] - points[1][0]) + 3 * t * t * (points[3][0] - points[2][0]),
        dz: 3 * u * u * (points[1][1] - points[0][1]) + 6 * u * t * (points[2][1] - points[1][1]) + 3 * t * t * (points[3][1] - points[2][1]),
    };
}

// 1: leave left. 2–3: loop outside the stage. 4: enter from the right on a shallow downward diagonal.
const stages = [
    { start:1100, duration:1600, step:1, points:[[0,0],[-8,0],[-16,0],[-24,0]] },
    { start:2700, duration:1200, step:2, points:[[-24,0],[-40,0],[-40,-28],[24,-28]] },
    { start:3900, duration:300, step:3, points:[[24,-28],[46,-28],[46,-16],[-24,-16]] },
    { start:4200, duration:450, step:4, points:[[-24,-16],[-46,-16],[27,-6.8],[20,-5]] },
    { start:4650, duration:1200, step:4, points:[[20,-5],[13,-3.2],[0.8,-1.05],[0,0]] },
];
export const CAR_INTRO_DURATION = stages.at(-1).start + stages.at(-1).duration;
const fadeStart = stages.find(stage => stage.step === 4).start;
const arrival = stages.at(-1);
let total = 0;
for (const stage of stages) {
    stage.offset = total;
    stage.lengths = [0];
    let previous = point(stage.points,0);
    for (let index=1; index<=80; index++) {
        const next = point(stage.points,index/80);
        stage.lengths.push(stage.lengths.at(-1) + Math.hypot(next.x-previous.x,next.z-previous.z));
        previous = next;
    }
    total += stage.lengths.at(-1);
}

export function carIntroPath(elapsed, mobile) {
    const stage = stages.find(item => elapsed < item.start + item.duration) ?? stages.at(-1);
    const progress = clamp((elapsed-stage.start)/stage.duration);
    // Keep the fast loop moving through its joins; brake only on the final arrival.
    const t = stage.step === 3 || stage.step === 4 && stage !== arrival ? progress : stage === arrival ? 1-(1-progress)**2 : smooth(progress);
    const pose = point(stage.points,t);
    const sample = t*80;
    const lower = Math.floor(sample);
    const distance = stage.offset + stage.lengths[lower] + ((stage.lengths[Math.min(80,lower+1)]-stage.lengths[lower])*(sample-lower));
    const scale = mobile ? 0.7 : 1;
    return {
        x:pose.x*scale, z:pose.z*scale,
        yaw:Math.atan2(pose.dx,pose.dz),
        distance:distance*scale,
        step:stage.step,
        light:smooth((elapsed-fadeStart)/(CAR_INTRO_DURATION-fadeStart)),
        overhead:smooth((elapsed-2400)/1000)*(1-smooth((elapsed-fadeStart)/(arrival.start-fadeStart))),
        wheelCloseup:1-smooth((elapsed-2000)/700),
        wheelSpinSpeed:(1.2+smooth(elapsed/1000)*16.8)*(1-smooth((elapsed-1100)/900)),
    };
}

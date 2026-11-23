import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  length: number;
  alpha: number;
  phase: number;
  speed: number;
  color: string;
}

@Component({
  standalone: false,
  selector: 'app-particles',
  templateUrl: './particles.component.html',
  styleUrls: ['./particles.component.scss']
})
export class ParticlesComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() theme = 'ice';
  @ViewChild('canvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  private ctx: CanvasRenderingContext2D | null = null;
  private rafId: number | null = null;
  private particles: Particle[] = [];
  private width = 0;
  private height = 0;
  private lastTime = 0;
  private elapsed = 0;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) {
      return;
    }
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.initParticles();
    this.startLoop();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['theme'] && !changes['theme'].firstChange) {
      this.initParticles();
    }
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.resize();
    this.initParticles();
  }

  private resize(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.ctx) {
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    canvas.width = Math.floor(this.width * dpr);
    canvas.height = Math.floor(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private initParticles(): void {
    const w = this.width || window.innerWidth;
    const h = this.height || window.innerHeight;
    const isMobile = w < 768;
    const count = isMobile ? 65 : 130;
    const list: Particle[] = [];

    if (this.theme === 'ice') {
      //snowflakes
      for (let i = 0; i < count; i++) {
        const depth = 0.35 + Math.random() * 0.65;
        list.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 16,
          vy: (26 + Math.random() * 44) * depth,
          size: (1.2 + Math.random() * 2.8) * depth,
          length: 0,
          alpha: 0.3 + Math.random() * 0.65,
          phase: Math.random() * Math.PI * 2,
          speed: 0.6 + Math.random() * 1.1,
          color: '#ffffff'
        });
      }
    } else if (this.theme === 'greek') {
      // 'foam' bubbles that ride waves and dissolve
      const foamCount = isMobile ? 55 : 110;
      for (let i = 0; i < foamCount; i++) {
        list.push({
          x: Math.random() * w,
          y: h - Math.random() * 55,
          vx: (Math.random() - 0.5) * 18,
          vy: 0,
          size: 1.4 + Math.random() * 3.8,
          length: Math.floor(Math.random() * 3), // wave layer index (0..2)
          alpha: 0.25 + Math.random() * 0.55,
          phase: Math.random() * Math.PI * 2,
          speed: 0.7 + Math.random() * 1.1,
          color: '#ffffff'
        });
      }
    } else if (this.theme === 'rainbow') {
      const neonCount = isMobile ? 55 : 110;
      for (let i = 0; i < neonCount; i++) {
        const hue = 175 + Math.random() * 145; // cyan -> violet -> magenta
        list.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: 0,
          vy: (Math.random() > 0.5 ? 1 : -1) * (35 + Math.random() * 65),
          size: 1.5 + Math.random() * 1.2,
          length: 28 + Math.random() * 90,
          alpha: 0.35 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
          speed: 0.8 + Math.random(),
          color: `hsl(${Math.floor(hue)}, 90%, 62%)`
        });
      }
    } else if (this.theme === 'end') {
      const emberCount = isMobile ? 35 : 70;
      for (let i = 0; i < emberCount; i++) {
        const isGreen = Math.random() < 0.28;
        list.push({
          x: Math.random() * w,
          y: h - Math.random() * (h * 0.35),
          vx: (Math.random() - 0.5) * 18,
          vy: -(14 + Math.random() * 32),
          size: 1.5 + Math.random() * 2.8,
          length: 0,
          alpha: 0.25 + Math.random() * 0.6,
          phase: Math.random() * Math.PI * 2,
          speed: 0.9 + Math.random() * 1.4,
          color: isGreen ? '#39c25b' : '#f8505b'
        });
      }
    } else if (this.theme === 'forest') {
      // fireflies (length = 0) + drifting petals (length = 1)
      const fireflyCount = isMobile ? 25 : 50;
      for (let i = 0; i < fireflyCount; i++) {
        const colors = ['#e1e389', '#a9f59e', '#ffe999', '#bceca6'];
        list.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 16,
          vy: (Math.random() - 0.5) * 12,
          size: 1.6 + Math.random() * 2.4,
          length: 0,
          alpha: 0.35 + Math.random() * 0.6,
          phase: Math.random() * Math.PI * 2,
          speed: 0.6 + Math.random() * 1.3,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      const petalCount = isMobile ? 12 : 25;
      for (let i = 0; i < petalCount; i++) {
        const petalColors = ['#ff91ca', '#f7b2d9', '#ec92e1', '#ffd6eb'];
        list.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: 8 + Math.random() * 14,
          vy: 14 + Math.random() * 20,
          size: 3 + Math.random() * 2.8,
          length: 2,
          alpha: 0.35 + Math.random() * 0.4,
          phase: Math.random() * Math.PI * 2,
          speed: 0.7 + Math.random() * 1.0,
          color: petalColors[Math.floor(Math.random() * petalColors.length)]
        });
      }
    } else if (this.theme === 'royal') {
      // hearth embers & drifting ash
      const moteCount = isMobile ? 35 : 70;
      for (let i = 0; i < moteCount; i++) {
        const isAsh = Math.random() < 0.35;
        const emberColors = ['#ff9436', '#e85d24', '#ffb84d', '#c93b1a'];
        list.push({
          x: Math.random() * w,
          y: h - Math.random() * (h * 0.65),
          vx: (Math.random() - 0.5) * 14,
          vy: isAsh ? -(10 + Math.random() * 18) : -(20 + Math.random() * 34),
          size: isAsh ? 1.0 + Math.random() * 1.6 : 1.2 + Math.random() * 2.0,
          length: isAsh ? 0 : 1,
          alpha: isAsh ? 0.18 + Math.random() * 0.25 : 0.35 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
          speed: 0.7 + Math.random() * 1.3,
          color: isAsh ? '#a89f96' : emberColors[Math.floor(Math.random() * emberColors.length)]
        });
      }
    }

    this.particles = list;
  }

  private startLoop(): void {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    this.lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;

      if (!document.hidden) {
        this.elapsed += reducedMotion ? dt * 0.2 : dt;
        this.renderFrame(reducedMotion ? dt * 0.2 : dt);
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private renderFrame(dt: number): void {
    const ctx = this.ctx;
    if (!ctx) {
      return;
    }
    const w = this.width;
    const h = this.height;
    ctx.clearRect(0, 0, w, h);

    if (this.theme === 'ice') {
      this.drawIce(ctx, w, h, dt);
    } else if (this.theme === 'greek') {
      this.drawGreek(ctx, w, h, dt);
    } else if (this.theme === 'rainbow') {
      this.drawRainbow(ctx, w, h, dt);
    } else if (this.theme === 'end') {
      this.drawEnd(ctx, w, h, dt);
    } else if (this.theme === 'forest') {
      this.drawForest(ctx, w, h, dt);
    } else if (this.theme === 'royal') {
      this.drawRoyal(ctx, w, h, dt);
    }
  }

  private drawIce(ctx: CanvasRenderingContext2D, w: number, h: number, dt: number): void {
    ctx.save();
    ctx.shadowColor = 'rgba(200, 240, 255, 0.9)';
    ctx.shadowBlur = 8;

    for (const p of this.particles) {
      p.y += p.vy * dt;
      p.x += (p.vx + Math.sin(this.elapsed * p.speed + p.phase) * 18) * dt;

      if (p.y > h + 10) {
        p.y = -10;
        p.x = Math.random() * w;
      }
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawGreek(ctx: CanvasRenderingContext2D, w: number, h: number, dt: number): void {
    ctx.save();

    const waveY = (x: number, layer: number): number => {
      // Surge forward onto shore and gently recede
      const surge = Math.sin(this.elapsed * (0.55 + layer * 0.12) + layer * 1.9) * (14 + layer * 4);
      const baseY = h - (22 + layer * 16) - surge;
      const ripple =
        Math.sin(x * (0.0045 + layer * 0.0012) + this.elapsed * (1.1 - layer * 0.18) + layer * 2) * (6 + layer * 2) +
        Math.cos(x * 0.011 - this.elapsed * 0.85 + layer) * 3;
      return baseY + ripple;
    };

    // 3 waves back-to-front with 'foamy' bubbles in each one
    for (let layer = 2; layer >= 0; layer--) {
      const points: { x: number; y: number }[] = [];
      for (let x = 0; x <= w + 20; x += 20) {
        points.push({ x, y: waveY(x, layer) });
      }

      // Traslucent water body
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (const pt of points) {
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, h - 85, 0, h);
      if (layer === 2) {
        grad.addColorStop(0, 'rgba(105, 200, 235, 0.20)');
        grad.addColorStop(1, 'rgba(24, 105, 165, 0.26)');
      } else if (layer === 1) {
        grad.addColorStop(0, 'rgba(85, 185, 228, 0.26)');
        grad.addColorStop(1, 'rgba(18, 92, 152, 0.34)');
      } else {
        grad.addColorStop(0, 'rgba(65, 168, 218, 0.30)');
        grad.addColorStop(1, 'rgba(14, 72, 132, 0.42)');
      }
      ctx.fillStyle = grad;
      ctx.fill();

      // 'foamy' bubbles along the crest of each wave
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = `rgba(255, 252, 245, ${0.65 - layer * 0.12})`;
      ctx.lineWidth = 3.2 - layer * 0.6;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Trailing foam just behind each wave crest
    for (const p of this.particles) {
      p.x += (p.vx + Math.sin(this.elapsed * p.speed + p.phase) * 8) * dt;
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;

      const crestY = waveY(p.x, p.length);
      const offsetBehind = 4 + ((Math.sin(this.elapsed * p.speed + p.phase) + 1) * 0.5) * 20;
      const y = crestY + offsetBehind;
      const shimmer = 0.4 + 0.6 * Math.abs(Math.sin(this.elapsed * p.speed + p.phase));

      ctx.globalAlpha = p.alpha * shimmer;
      ctx.fillStyle = 'rgba(255, 253, 248, 0.9)';
      ctx.beginPath();
      ctx.arc(p.x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawRainbow(ctx: CanvasRenderingContext2D, w: number, h: number, dt: number): void {
    ctx.save();
    ctx.lineCap = 'round';

    for (const p of this.particles) {
      p.y += p.vy * dt;
      if (p.vy > 0 && p.y - p.length > h) {
        p.y = -p.length;
        p.x = Math.random() * w;
      } else if (p.vy < 0 && p.y + p.length < 0) {
        p.y = h + p.length;
        p.x = Math.random() * w;
      }

      const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.length);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.5, p.color);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.globalAlpha = p.alpha;
      ctx.strokeStyle = grad;
      ctx.lineWidth = p.size;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y + p.length);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawEnd(ctx: CanvasRenderingContext2D, w: number, h: number, dt: number): void {
    ctx.save();

    const slickY = (x: number, layer: number): number => {
      const baseY = h - 34 - layer * 18;
      return (
        baseY +
        Math.sin(x * (0.0028 + layer * 0.001) + this.elapsed * (0.35 + layer * 0.1) + layer * 1.7) * (9 + layer * 3) +
        Math.cos(x * 0.0065 - this.elapsed * 0.28 + layer) * 5
      );
    };

    // oil base pooling along the bottom
    for (let layer = 2; layer >= 0; layer--) {
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w + 24; x += 24) {
        ctx.lineTo(x, slickY(x, layer));
      }
      ctx.lineTo(w, h);
      ctx.closePath();

      const oilGrad = ctx.createLinearGradient(0, h - 105, 0, h);
      if (layer === 2) {
        oilGrad.addColorStop(0, 'rgba(12, 10, 14, 0.35)');
        oilGrad.addColorStop(1, 'rgba(5, 4, 7, 0.72)');
      } else if (layer === 1) {
        oilGrad.addColorStop(0, 'rgba(16, 12, 18, 0.55)');
        oilGrad.addColorStop(1, 'rgba(6, 5, 8, 0.85)');
      } else {
        oilGrad.addColorStop(0, 'rgba(10, 8, 12, 0.75)');
        oilGrad.addColorStop(1, 'rgba(4, 3, 5, 0.92)');
      }
      ctx.fillStyle = oilGrad;
      ctx.fill();

      // Iridescent oil-slick effects along the waves
      const shift = Math.sin(this.elapsed * (0.28 + layer * 0.09) + layer * 1.4) * 0.35;
      const sheenGrad = ctx.createLinearGradient(
        w * (shift - 0.15),
        h - 90,
        w * (shift + 1.15),
        h
      );
      sheenGrad.addColorStop(0.0, 'rgba(140, 20, 45, 0.0)');
      sheenGrad.addColorStop(0.20, 'rgba(222, 60, 80, 0.28)');
      sheenGrad.addColorStop(0.42, 'rgba(35, 185, 95, 0.26)');
      sheenGrad.addColorStop(0.62, 'rgba(40, 160, 210, 0.24)');
      sheenGrad.addColorStop(0.82, 'rgba(145, 55, 215, 0.26)');
      sheenGrad.addColorStop(1.0, 'rgba(140, 20, 45, 0.0)');

      ctx.fillStyle = sheenGrad;
      ctx.fill();

      // Subtle wet specular highlight along the top oil meniscus
      ctx.beginPath();
      for (let x = 0; x <= w + 24; x += 24) {
        const y = slickY(x, layer);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = sheenGrad;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // red and green effects drifting up
    for (const p of this.particles) {
      p.y += p.vy * dt;
      p.x += (p.vx + Math.sin(this.elapsed * p.speed + p.phase) * 14) * dt;

      const distFromBottom = h - p.y;
      const maxHeight = h * 0.42;
      const fade = Math.max(0, 1 - distFromBottom / maxHeight);

      if (distFromBottom > maxHeight) {
        p.y = h + Math.random() * 15;
        p.x = Math.random() * w;
      }

      ctx.globalAlpha = p.alpha * fade;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawForest(ctx: CanvasRenderingContext2D, w: number, h: number, dt: number): void {
    ctx.save();

    for (const p of this.particles) {
      if (p.length === 0) {
        // fireflies wandering around
        p.x += (p.vx + Math.sin(this.elapsed * p.speed + p.phase) * 14) * dt;
        p.y += (p.vy + Math.cos(this.elapsed * p.speed * 0.8 + p.phase) * 10) * dt;

        if (p.x < -12) p.x = w + 12;
        if (p.x > w + 12) p.x = -12;
        if (p.y < -12) p.y = h + 12;
        if (p.y > h + 12) p.y = -12;

        const pulse = 0.25 + 0.75 * Math.pow((Math.sin(this.elapsed * p.speed * 1.4 + p.phase) + 1) * 0.5, 2);
        ctx.globalAlpha = p.alpha * pulse;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // pink petals drifting down
        p.x += (p.vx + Math.sin(this.elapsed * p.speed + p.phase) * 18) * dt;
        p.y += p.vy * dt;

        if (p.y > h + 12) {
          p.y = -12;
          p.x = Math.random() * w;
        }
        if (p.x > w + 12) p.x = -12;

        const angle = this.elapsed * p.speed + p.phase;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
  }

  private drawRoyal(ctx: CanvasRenderingContext2D, w: number, h: number, dt: number): void {
    ctx.save();

    // torchlightglow along the bottom edge
    const hearth = ctx.createLinearGradient(0, h - 120, 0, h);
    const flicker = 0.09 + Math.sin(this.elapsed * 2.3) * 0.02 + Math.cos(this.elapsed * 3.7) * 0.015;
    hearth.addColorStop(0, 'rgba(214, 110, 30, 0)');
    hearth.addColorStop(1, `rgba(214, 110, 30, ${flicker})`);
    ctx.fillStyle = hearth;
    ctx.fillRect(0, h - 120, w, 120);

    // Rising embers and ash
    for (const p of this.particles) {
      p.y += p.vy * dt;
      p.x += (p.vx + Math.sin(this.elapsed * p.speed + p.phase) * 14) * dt;

      const distFromBottom = h - p.y;
      const maxHeight = h * 0.7;
      const fade = Math.max(0, 1 - distFromBottom / maxHeight);

      if (distFromBottom > maxHeight) {
        p.y = h + Math.random() * 12;
        p.x = Math.random() * w;
      }
      if (p.x < -12) p.x = w + 12;
      if (p.x > w + 12) p.x = -12;

      const emberFlicker = p.length === 1 ? 0.55 + 0.45 * Math.sin(this.elapsed * p.speed * 3 + p.phase) : 1;
      ctx.globalAlpha = p.alpha * fade * emberFlicker;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.length === 1 ? p.color : 'transparent';
      ctx.shadowBlur = p.length === 1 ? 8 : 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

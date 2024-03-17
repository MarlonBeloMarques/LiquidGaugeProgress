import React, {useEffect} from 'react';
import {
  Canvas,
  Circle,
  Group,
  Skia,
  Text,
  useFont,
} from '@shopify/react-native-skia';
import {area, scaleLinear} from 'd3';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  size: number;
  value: number;
};

const LiquidGaugeProgress = ({size, value}: Props) => {
  const radius = size * 0.5;
  const circleThickness = radius * 0.05;

  const circleFillGap = 0.05 * radius;
  const fillCircleMargin = circleThickness + circleFillGap;
  const fillCircleRadius = radius - fillCircleMargin;

  const minValue = 0;
  const maxValue = 100;
  const fillPercent = Math.max(minValue, Math.min(maxValue, value)) / maxValue;

  const waveCount = 1;
  const waveClipCount = waveCount + 1;
  const waveLength = (fillCircleRadius * 2) / waveCount;
  const waveClipWidth = waveLength * waveClipCount;
  const waveHeight = fillCircleRadius * 0.1;

  // font
  const fontSize = radius / 2;
  const font = useFont(require('./assets/fonts/Roboto-Bold.ttf'), fontSize);

  const textTransform = [{translateY: size * 0.5 - fontSize * 0.7}];

  const data: Array<[number, number]> = [];
  for (let i = 0; i <= 40 * waveClipCount; i++) {
    data.push([i / (40 * waveClipCount), i / 40]);
  }

  const waveScaleX = scaleLinear().range([0, waveClipWidth]).domain([0, 1]);
  const waveScaleY = scaleLinear().range([0, waveHeight]).domain([0, 1]);

  const clipArea = area()
    .x(d => {
      return waveScaleX(d[0]);
    })
    .y0(d => {
      return waveScaleY(Math.sin(d[1] * 2 * Math.PI));
    })
    .y1(_d => {
      return fillCircleRadius * 2 + waveHeight;
    });

  const clipSvgPath = clipArea(data);

  // animated
  const translateXAnimated = useSharedValue(0);
  const translateYPercent = useSharedValue(0);
  const textValue = useSharedValue(0);

  const text = useDerivedValue(() => {
    return `${textValue.value.toFixed(0)}`;
  }, [textValue]);

  const textWidth = font?.getTextWidth(`${value}`) ?? 0;
  const textTranslateX = radius - textWidth * 0.5;

  useEffect(() => {
    textValue.value = withTiming(value, {duration: 1000});
  }, [value]);

  useEffect(() => {
    translateYPercent.value = withTiming(fillPercent, {duration: 1000});
  }, [fillPercent]);

  useEffect(() => {
    translateXAnimated.value = withRepeat(
      withTiming(1, {duration: 9000, easing: Easing.linear}),
      -1,
    );
  }, []);

  const clipPath = useDerivedValue(() => {
    const clipP = Skia.Path.MakeFromSVGString(clipSvgPath!);
    const transformMatrix = Skia.Matrix();
    transformMatrix.translate(
      fillCircleMargin - waveLength * translateXAnimated.value,
      fillCircleMargin +
        (1 - translateYPercent.value) * fillCircleRadius * 2 -
        waveHeight,
    );
    clipP?.transform(transformMatrix);
    return clipP;
  }, [translateXAnimated]);

  return (
    // <Canvas style={{width: size, height: size}}>
    <Canvas style={{width: size, height: size}}>
      <Circle
        cx={radius}
        cy={radius}
        r={radius - circleThickness * 0.5}
        color="#178BCA"
        style="stroke"
        strokeWidth={circleThickness}
      />

      <Text
        x={textTranslateX}
        y={fontSize}
        text={text}
        font={font}
        color="#045681"
        transform={textTransform}
      />

      {/* <Path path={clipPath!} color="pink" /> */}

      <Group clip={clipPath!}>
        <Circle
          cx={radius}
          cy={radius}
          r={fillCircleRadius}
          color="#178BCA"
          // style="fill"
        />

        <Text
          x={textTranslateX}
          y={fontSize}
          text={text}
          font={font}
          color="#A4DBF8"
          transform={textTransform}
        />
      </Group>
    </Canvas>
    // </Canvas>
  );
};

export default LiquidGaugeProgress;

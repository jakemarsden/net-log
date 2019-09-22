// We want to be able to create "chart.js" chart configurations server-side, but "@types/chart.js" contains references
// to types only available client-side (eg. HTMLCanvasElement)

declare module "chart.js" {
    type ChartType = 'line' | 'bar' | 'horizontalBar' | 'radar' | 'doughnut' | 'polarArea' | 'bubble' | 'pie' | 'scatter';

    type TimeUnit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

    type ScaleType = 'category' | 'linear' | 'logarithmic' | 'time' | 'radialLinear';

    type PointStyle = 'circle' | 'cross' | 'crossRot' | 'dash' | 'line' | 'rect' | 'rectRounded' | 'rectRot' | 'star' | 'triangle';

    type PositionType = 'left' | 'right' | 'top' | 'bottom';

    type InteractionMode = 'point' | 'nearest' | 'single' | 'label' | 'index' | 'x-axis' | 'dataset' | 'x' | 'y';

    type Easing = 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic' |
        'easeInQuart' | 'easeOutQuart' | 'easeInOutQuart' | 'easeInQuint' | 'easeOutQuint' | 'easeInOutQuint' | 'easeInSine' | 'easeOutSine' |
        'easeInOutSine' | 'easeInExpo' | 'easeOutExpo' | 'easeInOutExpo' | 'easeInCirc' | 'easeOutCirc' | 'easeInOutCirc' | 'easeInElastic' |
        'easeOutElastic' | 'easeInOutElastic' | 'easeInBack' | 'easeOutBack' | 'easeInOutBack' | 'easeInBounce' | 'easeOutBounce' | 'easeInOutBounce';

    type TextAlignment = 'left' | 'center' | 'right';

    type BorderAlignment = 'center' | 'inner';

    type BorderWidth = number | { [key in PositionType]?: number };

    interface ChartArea {
        top: number;
        right: number;
        bottom: number;
        left: number;
    }

    interface ChartLegendItem {
        text?: string;
        fillStyle?: string;
        hidden?: boolean;
        lineCap?: 'butt' | 'round' | 'square';
        lineDash?: number[];
        lineDashOffset?: number;
        lineJoin?: 'bevel' | 'round' | 'miter';
        lineWidth?: number;
        strokeStyle?: string;
        pointStyle?: PointStyle;
    }

    interface ChartLegendLabelItem extends ChartLegendItem {
        datasetIndex: number;
    }

    interface ChartTooltipItem {
        label?: string;
        value?: string;
        xLabel?: string | number;
        yLabel?: string | number;
        datasetIndex?: number;
        index?: number;
        x?: number;
        y?: number;
    }

    interface ChartTooltipLabelColor {
        borderColor: ChartColor;
        backgroundColor: ChartColor;
    }

    interface ChartAnimationParameter {
        chartInstance?: any;
        animationObject?: any;
    }

    interface ChartPoint {
        x?: number | string | Date;
        y?: number | string | Date;
        r?: number;
        t?: number | string | Date;
    }

    interface ChartConfiguration {
        type?: ChartType | string;
        data?: ChartData;
        options?: ChartOptions;
    }

    interface ChartData {
        labels?: Array<string | string[]>;
        datasets?: ChartDataSets[];
    }

    interface RadialChartOptions extends ChartOptions {
        scale?: RadialLinearScale;
    }

    interface ChartSize {
        height: number;
        width: number;
    }

    interface ChartOptions {
        responsive?: boolean;
        responsiveAnimationDuration?: number;
        aspectRatio?: number;
        maintainAspectRatio?: boolean;
        events?: string[];
        title?: ChartTitleOptions;
        legend?: ChartLegendOptions;
        tooltips?: ChartTooltipOptions;
        hover?: ChartHoverOptions;
        animation?: ChartAnimationOptions;
        elements?: ChartElementsOptions;
        layout?: ChartLayoutOptions;
        scale?: { display?: boolean };
        scales?: ChartScales;
        showLines?: boolean;
        spanGaps?: boolean;
        cutoutPercentage?: number;
        circumference?: number;
        rotation?: number;
        devicePixelRatio?: number;
        plugins?: ChartPluginsOptions;
    }

    interface ChartFontOptions {
        defaultFontColor?: ChartColor;
        defaultFontFamily?: string;
        defaultFontSize?: number;
        defaultFontStyle?: string;
    }

    interface ChartTitleOptions {
        display?: boolean;
        position?: PositionType;
        fullWidth?: boolean;
        fontSize?: number;
        fontFamily?: string;
        fontColor?: ChartColor;
        fontStyle?: string;
        padding?: number;
        text?: string | string[];
    }

    interface ChartLegendOptions {
        display?: boolean;
        position?: PositionType;
        fullWidth?: boolean;
        labels?: ChartLegendLabelOptions;
        reverse?: boolean;
    }

    interface ChartLegendLabelOptions {
        boxWidth?: number;
        fontSize?: number;
        fontStyle?: string;
        fontColor?: ChartColor;
        fontFamily?: string;
        padding?: number;
        usePointStyle?: boolean;
    }

    interface ChartTooltipOptions {
        enabled?: boolean;
        mode?: InteractionMode;
        intersect?: boolean;
        backgroundColor?: ChartColor;
        titleAlign?: TextAlignment;
        titleFontFamily?: string;
        titleFontSize?: number;
        titleFontStyle?: string;
        titleFontColor?: ChartColor;
        titleSpacing?: number;
        titleMarginBottom?: number;
        bodyAlign?: TextAlignment;
        bodyFontFamily?: string;
        bodyFontSize?: number;
        bodyFontStyle?: string;
        bodyFontColor?: ChartColor;
        bodySpacing?: number;
        footerAlign?: TextAlignment;
        footerFontFamily?: string;
        footerFontSize?: number;
        footerFontStyle?: string;
        footerFontColor?: ChartColor;
        footerSpacing?: number;
        footerMarginTop?: number;
        xPadding?: number;
        yPadding?: number;
        caretSize?: number;
        cornerRadius?: number;
        multiKeyBackground?: string;
        position?: string;
        caretPadding?: number;
        displayColors?: boolean;
        borderColor?: ChartColor;
        borderWidth?: number;
    }

    // NOTE: declare plugin options as interface instead of inline '{ [plugin: string]: any }'
    // to allow module augmentation in case some plugins want to strictly type their options.
    interface ChartPluginsOptions {
        [pluginId: string]: any;
    }

    interface ChartTooltipsStaticConfiguration {
        positioners: { [mode: string]: ChartTooltipPositioner };
    }

    type ChartTooltipPositioner = (elements: any[], eventPosition: Point) => Point;

    interface ChartHoverOptions {
        mode?: InteractionMode;
        animationDuration?: number;
        intersect?: boolean;
    }

    interface ChartAnimationObject {
        currentStep?: number;
        numSteps?: number;
        easing?: Easing;
    }

    interface ChartAnimationOptions {
        duration?: number;
        easing?: Easing;
        animateRotate?: boolean;
        animateScale?: boolean;
    }

    interface ChartElementsOptions {
        point?: ChartPointOptions;
        line?: ChartLineOptions;
        arc?: ChartArcOptions;
        rectangle?: ChartRectangleOptions;
    }

    interface ChartArcOptions {
        backgroundColor?: ChartColor;
        borderColor?: ChartColor;
        borderWidth?: number;
    }

    interface ChartLineOptions {
        cubicInterpolationMode?: 'default' | 'monotone';
        tension?: number;
        backgroundColor?: ChartColor;
        borderWidth?: number;
        borderColor?: ChartColor;
        borderCapStyle?: string;
        borderDash?: any[];
        borderDashOffset?: number;
        borderJoinStyle?: string;
        capBezierPoints?: boolean;
        fill?: 'zero' | 'top' | 'bottom' | boolean;
        stepped?: boolean;
    }

    interface ChartPointOptions {
        radius?: number;
        pointStyle?: PointStyle;
        backgroundColor?: ChartColor;
        borderWidth?: number;
        borderColor?: ChartColor;
        hitRadius?: number;
        hoverRadius?: number;
        hoverBorderWidth?: number;
    }

    interface ChartRectangleOptions {
        backgroundColor?: ChartColor;
        borderWidth?: number;
        borderColor?: ChartColor;
        borderSkipped?: string;
    }

    interface ChartLayoutOptions {
        padding?: ChartLayoutPaddingObject | number;
    }

    interface ChartLayoutPaddingObject {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
    }

    interface GridLineOptions {
        display?: boolean;
        color?: ChartColor;
        borderDash?: number[];
        borderDashOffset?: number;
        lineWidth?: number | number[];
        drawBorder?: boolean;
        drawOnChartArea?: boolean;
        drawTicks?: boolean;
        tickMarkLength?: number;
        zeroLineWidth?: number;
        zeroLineColor?: ChartColor;
        zeroLineBorderDash?: number[];
        zeroLineBorderDashOffset?: number;
        offsetGridLines?: boolean;
    }

    interface ScaleTitleOptions {
        display?: boolean;
        labelString?: string;
        lineHeight?: number | string;
        fontColor?: ChartColor;
        fontFamily?: string;
        fontSize?: number;
        fontStyle?: string;
        padding?: ChartLayoutPaddingObject | number;
    }

    interface TickOptions extends NestedTickOptions {
        minor?: NestedTickOptions | false;
        major?: MajorTickOptions | false;
    }

    interface NestedTickOptions {
        autoSkip?: boolean;
        autoSkipPadding?: number;
        backdropColor?: ChartColor;
        backdropPaddingX?: number;
        backdropPaddingY?: number;
        beginAtZero?: boolean;
        display?: boolean;
        fontColor?: ChartColor;
        fontFamily?: string;
        fontSize?: number;
        fontStyle?: string;
        labelOffset?: number;
        lineHeight?: number;
        max?: any;
        maxRotation?: number;
        maxTicksLimit?: number;
        min?: any;
        minRotation?: number;
        mirror?: boolean;
        padding?: number;
        reverse?: boolean;
        showLabelBackdrop?: boolean;
        source?: 'auto' | 'data' | 'labels';
        stepSize?: number;
        suggestedMax?: number;
        suggestedMin?: number;
    }

    interface MajorTickOptions extends NestedTickOptions {
        enabled?: boolean;
    }

    interface AngleLineOptions {
        display?: boolean;
        color?: ChartColor;
        lineWidth?: number;
    }

    interface PointLabelOptions {
        fontColor?: ChartColor;
        fontFamily?: string;
        fontSize?: number;
        fontStyle?: string;
    }

    interface LinearTickOptions extends TickOptions {
        maxTicksLimit?: number;
        stepSize?: number;
        precision?: number;
        suggestedMin?: number;
        suggestedMax?: number;
    }

    // tslint:disable-next-line no-empty-interface
    interface LogarithmicTickOptions extends TickOptions {
    }

    type ChartColor = string | string[];

    type Scriptable<T> = (ctx: {
        chart?: object;
        dataIndex?: number;
        dataset?: ChartDataSets
        datasetIndex?: number;
    }) => T;

    interface ChartDataSets {
        cubicInterpolationMode?: 'default' | 'monotone';
        backgroundColor?: ChartColor | ChartColor[] | Scriptable<ChartColor>;
        borderAlign?: BorderAlignment | BorderAlignment[] | Scriptable<BorderAlignment>;
        borderWidth?: BorderWidth | BorderWidth[] | Scriptable<BorderWidth>;
        borderColor?: ChartColor | ChartColor[] | Scriptable<ChartColor>;
        borderCapStyle?: 'butt' | 'round' | 'square';
        borderDash?: number[];
        borderDashOffset?: number;
        borderJoinStyle?: 'bevel' | 'round' | 'miter';
        borderSkipped?: PositionType | PositionType[] | Scriptable<PositionType>;
        data?: Array<number | null | undefined> | ChartPoint[];
        fill?: boolean | number | string;
        hitRadius?: number | number[] | Scriptable<number>;
        hoverBackgroundColor?: ChartColor | ChartColor[] | Scriptable<ChartColor>;
        hoverBorderColor?: ChartColor | ChartColor[] | Scriptable<ChartColor>;
        hoverBorderWidth?: number | number[] | Scriptable<number>;
        label?: string;
        lineTension?: number;
        steppedLine?: 'before' | 'after' | 'middle' | boolean;
        pointBorderColor?: ChartColor | ChartColor[] | Scriptable<ChartColor>;
        pointBackgroundColor?: ChartColor | ChartColor[] | Scriptable<ChartColor>;
        pointBorderWidth?: number | number[] | Scriptable<number>;
        pointRadius?: number | number[] | Scriptable<number>;
        pointRotation?: number | number[] | Scriptable<number>;
        pointHoverRadius?: number | number[] | Scriptable<number>;
        pointHitRadius?: number | number[] | Scriptable<number>;
        pointHoverBackgroundColor?: ChartColor | ChartColor[] | Scriptable<ChartColor>;
        pointHoverBorderColor?: ChartColor | ChartColor[] | Scriptable<ChartColor>;
        pointHoverBorderWidth?: number | number[] | Scriptable<number>;
        pointStyle?: PointStyle | Array<PointStyle> | Scriptable<PointStyle>;
        radius?: number | number[] | Scriptable<number>;
        rotation?: number | number[] | Scriptable<number>;
        xAxisID?: string;
        yAxisID?: string;
        type?: ChartType | string;
        hidden?: boolean;
        hideInLegendAndTooltip?: boolean;
        showLine?: boolean;
        stack?: string;
        spanGaps?: boolean;
    }

    interface ChartScales {
        type?: ScaleType | string;
        display?: boolean;
        position?: PositionType | string;
        gridLines?: GridLineOptions;
        scaleLabel?: ScaleTitleOptions;
        ticks?: TickOptions;
        xAxes?: ChartXAxe[];
        yAxes?: ChartYAxe[];
    }

    interface CommonAxe {
        bounds?: string;
        type?: ScaleType | string;
        display?: boolean;
        id?: string;
        stacked?: boolean;
        position?: string;
        ticks?: TickOptions;
        gridLines?: GridLineOptions;
        barThickness?: number | "flex";
        maxBarThickness?: number;
        minBarLength?: number;
        scaleLabel?: ScaleTitleOptions;
        time?: TimeScale;
        offset?: boolean;
    }

    interface ChartXAxe extends CommonAxe {
        categoryPercentage?: number;
        barPercentage?: number;
        distribution?: 'linear' | 'series';
    }

    // tslint:disable-next-line no-empty-interface
    interface ChartYAxe extends CommonAxe {
    }

    interface LinearScale extends ChartScales {
        ticks?: LinearTickOptions;
    }

    interface LogarithmicScale extends ChartScales {
        ticks?: LogarithmicTickOptions;
    }

    interface TimeDisplayFormat {
        millisecond?: string;
        second?: string;
        minute?: string;
        hour?: string;
        day?: string;
        week?: string;
        month?: string;
        quarter?: string;
        year?: string;
    }

    interface TimeScale extends ChartScales {
        displayFormats?: TimeDisplayFormat;
        isoWeekday?: boolean;
        max?: string;
        min?: string;
        parser?: string | ((arg: any) => any);
        round?: TimeUnit;
        tooltipFormat?: string;
        unit?: TimeUnit;
        unitStepSize?: number;
        stepSize?: number;
        minUnit?: TimeUnit;
    }

    interface RadialLinearScale extends LinearScale {
        lineArc?: boolean;
        angleLines?: AngleLineOptions;
        pointLabels?: PointLabelOptions;
        ticks?: TickOptions;
    }

    interface Point {
        x: number;
        y: number;
    }

    interface ChartUpdateProps {
        duration?: number;
        lazy?: boolean;
        easing?: Easing;
    }

    interface ChartRenderProps {
        duration?: number;
        lazy?: boolean;
        easing?: Easing;
    }
}

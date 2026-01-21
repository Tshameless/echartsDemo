// 定义图表系列数据类型
export interface ChartSeriesData {
    name: string  //系列名称
    type: string   //系列类型
    stack?: string  //堆叠
    yAxisIndex?: number  //Y轴索引，只有doubleY为true时生效，否则不传这个属性
    data: Array<number | null>  //数据
    tableUnit?: string  //表格列单位
}

export interface AxisLabel {
    color?: string;
    fontSize?: string;
    fontWeight?: string;
    showMinLabel?: boolean | null;
    showMaxLabel?: boolean | null;
    formatter?: (value: number) => string;
}

export interface TableColumn {
    title: string;
    key: string;
}

//params类型
export interface LegendSelectChangedEvent {
    name: string;
    selected: Record<string, boolean>;
    type: string;
}

// 定义图表选项类型
export interface ChartOptions {
    doubleY?: boolean //默认为单Y轴，在子组件中赋值为true
    tooltipShow?: boolean //默认开启提示
    tooltipTrigger?: string //默认为 axis
    tooltipBackgroundColor?: string //默认提示背景色
    tooltipBorderColor?: string //默认提示边框色
    tooltipColor?: string //默认提示文字色
    tooltipFormatter?: (params: any) => string //默认提示格式化器,对于有特殊需求时，可自定义，如果需要修改组件的统一提示，请修改defaultTooltipFormatter函数
    legendshowValue?: boolean //默认显示图例
    legend?: any //图例配置 (使用 any 简化，具体类型可进一步细化)
    legendColor?: string //默认图例颜色
    legendFontSize?: number //默认图例字体大小
    legendFontWeight?: number //默认图例字体粗细
    legendLocation?: string //默认图例水平方向位置
    legendTop?: string //默认图例距离顶部
    legendOrient?: string //默认图例方向
    legendItemWidth?: number //默认图例项宽度
    legendItemHeight?: number //默认图例项高度
    legendRich?: Record<string, any> //默认图例项样式
    legendFormatter?: (name: string) => string //默认图例格式化器，可以通过在组件中自定义legendFormatter修改，也可以在legendRich统一修改legend样式
    dataZoom?: Array<any>//默认数据缩放,如果参数为空，则不显示，也可以在这里自定义数据缩放
    dataZoomShow?: boolean //默认数据缩放不显示
    dataZoomBottom?: string //默认数据缩放距离顶部
    dataZoomStart?: number, //默认数据缩放开始
    dataZoomEnd?: number, //默认数据缩放结束
    dataZoomHeight?: number //默认数据缩放高度
    tooltip?: { //默认提示框
        trigger?: string //默认提示框触发方式
        axisPointer?: { //默认提示框坐标轴指示器
            type?: string //默认提示框坐标轴指示器类型
            label?: { backgroundColor: string }
        }
        show?: boolean
        backgroundColor?: string
        borderColor?: string
        textStyle?: { color: string }
        formatter?: string | ((params: any) => string)
    }
    grid?: { //默认图表区域
        top?: string | number //默认图表区域距离顶部
        left?: string | number //默认图表区域距离左侧
        right?: string | number //默认图表区域距离右侧
        bottom?: string | number //默认图表区域距离底部
        containLabel?: boolean //默认图表区域是否包含标签
    }
    xAxis?: Array<any> //默认X轴，可以自定义整个X轴，也可以修改单个X轴的属性
    showXAxis?: boolean //默认显示X轴
    xName?: string //默认X轴名称
    xType?: string //默认X轴类型
    boundaryGap?: boolean //默认X轴是否间距
    xAxisLabel?: AxisLabel //默认X轴标签样式，可以修改单个X轴标签的样式，也可以统一修改
    timeList?: Array<string | number> //默认时间轴
    xColor?: string //默认X轴标签颜色
    xUnitColor?: string //默认X轴标签单位
    xFontSize?: string //默认X轴标签字体大小
    xFontWeight?: string //默认X轴标签字体粗细
    xNameGap?: number //默认X轴名称距离左侧
    xNameLocation?: string //默认X轴名称位置
    yAxis?: Array<any> //默认Y轴，可以自定义整个Y轴，也可以修改单个Y轴的属性
    alignTicks?: boolean //默认Y轴是否对齐,只有doubleY为true时生效,当这个为true的时候，且要求xAlignValue也为true，那么y轴两侧的数据会不能正确包含数据的上下限
    xAlignValue?: boolean//当双Y轴时，需要两侧的0轴对齐
    showYAxis?: boolean //默认显示Y轴
    yName?: string //默认Y轴名称
    yType?: string //默认Y轴类型
    compensateType?: string //补点类型,end:向后补点,start:向前补点,不传就是不补点,如果添加了这个参数进行了补点，且使用了表格，那么有个调用deleteLastPoint或者是deleteFirstPoint来删除首/尾点
    yAxisLabel?: AxisLabel //默认y轴标签样式，可以修改单个y轴标签的样式，也可以统一修改
    yColor?: string //默认Y轴标签颜色
    yUnitColor?: string //默认Y轴标签单位
    yFontSize?: string //默认Y轴标签字体大小
    yFontWeight?: string //默认Y轴标签字体粗细
    yFormatter?: (value: number) => string //默认Y轴格式化器，可以通过在组件中自定义yFormatter修改，也可以在yAxisRich统一修改y轴样式
    yAccuracy?: number //默认Y轴精度
    yNameGap?: number //默认Y轴名称距离顶部
    showYAxis1?: boolean //默认显示Y轴1
    yName1?: string //默认Y轴1名称
    yType1?: string //默认Y轴1类型
    yAxisLabel1?: AxisLabel //默认y轴标签样式，可以修改单个y轴标签的样式，也可以统一修改
    yColor1?: string //默认Y轴1标签颜色
    yFontSize1?: string //默认Y轴1标签字体大小
    yFormatter1?: (value: number) => string //默认Y轴格式化器，可以通过在组件中自定义yFormatter修改，也可以在yAxisRich统一修改y轴样式
    yFontWeight1?: string
    yAccuracy1?: number //默认Y轴1精度
    yNameGapOne?: number //默认Y轴1名称距离顶部
    series?: Array<ChartSeriesData> //默认数据
    title?: string //默认图表标题
    deleteLastPoint?: boolean //删除最后一个数据点
    deleteFirstPoint?: boolean //删除第一个数据点
    showTable?: boolean //默认显示表格
    visualMap?: any
}

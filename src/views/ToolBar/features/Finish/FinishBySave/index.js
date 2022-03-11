import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Checkbox, Popover, Radio } from 'antd'
import { getPreComponentArrayFromDataMap } from '../../../../utils/common'
import { preComponentList } from '../../../../Setting/Property/Component/PRE'
import { StyledFinishBySave } from './styles'

class FinishBySave extends PureComponent {

    static propTypes = {
        setting: PropTypes.object,
        onChangeSetting: PropTypes.func
    }

    state = {
        dependencies: []
    }

    componentDidMount() {
        const { onChangeSetting } = this.props
        let components = getPreComponentArrayFromDataMap()
        let dependencies = []
        const { pc, mobile } = preComponentList
        Array.from(new Set(components)).forEach(c => {
            let comp = null
            if (c.type === 'pc') {
                comp = pc.find(a => a.name === c.name)
            }
            if (c.type === 'mobile') {
                comp = mobile.find(a => a.name === c.name)
            }
            if (comp) {
                dependencies.push(...comp.dependencies)
            }
        })
        const noSameArr = Array.from(new Set(dependencies))
        if (noSameArr.length < 1) {
            onChangeSetting('isCreateDependenciesText', false)
        } else {
            onChangeSetting('isCreateDependenciesText', noSameArr)
        }
        this.setState({
            dependencies: noSameArr
        })
    }

    handleChange = (prop, value) => {
        const { onChangeSetting } = this.props
        onChangeSetting(prop, value)
    }

    handleDependenciesCheckbox = (e) => {
        const { checked } = e.target
        const { onChangeSetting } = this.props
        const { dependencies } = this.state

        if (checked) {
            onChangeSetting('isCreateDependenciesText', dependencies)
        } else {
            onChangeSetting('isCreateDependenciesText', false)
        }
    }

    render() {
        const { dependencies } = this.state
        const { env, setting } = this.props
        const isUpdate = env === 'custom'

        return (
            <StyledFinishBySave>
                <div>这是来自 <strong>custom</strong> 的一个<span className={ `highlight ${isUpdate ? 'update' : 'create'}`}>{isUpdate ? '更新' : '新建'}</span>操作，将会执行以下操作：</div>
                <ol className="tipList">
                    <li>节点的信息{ isUpdate ? '更新' : '保存' }到<span className="code">config_split.js</span>中；</li>
                    <li>碎片内容写入<span className="code">config.js</span>的 allData；</li>
                    <li>会生成一份代码，为了不影响原文件，所以代码被放置在源文件根目录的<span className="code">__tmp_split__</span>文件夹里，按需查用。</li>
                </ol>
                <div className="extraWp">
                    <div className="extraTitle">额外的可选操作：</div>
                    {
                        dependencies.length > 0 &&
                        <div className="extra">
                            <Checkbox checked={setting.isCreateDependenciesText} onChange={this.handleDependenciesCheckbox} />节点中含有预设组件，生成带有
                            <Popover
                                content={
                                    <ul style={{ padding: '0 0 0 12px', margin: 0 }}>
                                        {dependencies.map((d, i) => <li style={{ fontSize: '12px' }} key={i}>{d}</li>)}
                                    </ul>
                                }>
                                <Button type="link" style={{ fontSize:'12px', padding: 0, height: '22px' }}>这些依赖</Button>
                            </Popover>
                            的 .txt 文件，方便安装
                        </div>
                    }
                    <div className="extra" style={{ color: '#a7a7a7' }}>
                        <Checkbox checked={setting.isCreateLayout} disabled onChange={(e) => this.handleChange('isCreateLayout', e.target.checked)} />创建通栏碎片，并应用到项目中
                    </div>

                    <div className="extra" style={{ marginTop: '8px', color: '#a7a7a7' }}>React组件写法：</div>
                    <div className="extra" style={{ paddingLeft: '32px', marginTop: '4px', color: '#a7a7a7' }}>
                        <Radio.Group disabled value={setting.reactType} onChange={(e) => this.handleChange('reactType', e.target.value)}>
                            <Radio value="function"><span style={{ fontSize: '12px' }}>函数式写法</span></Radio>
                            <Radio value="class"><span style={{ fontSize: '12px' }}>class 写法</span></Radio>
                        </Radio.Group>
                    </div>
                </div>
            </StyledFinishBySave>
        );
    }
}

function mapStateToProps(state) {
    const { env } = state;
    return { env }
}

export default connect(mapStateToProps)(FinishBySave)

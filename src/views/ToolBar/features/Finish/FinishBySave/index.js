import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { StyledFinishBySave } from './styles'

class FinishBySave extends PureComponent {

    render() {
        return (
            <StyledFinishBySave>
                <div>这是来自 <strong>custom</strong> 的一个<span className="update">更新</span>操作，所以会执行以下操作：</div>
                <ol className="tipList">
                    <li style={{ color: 'green' }}>节点的信息会更新到<span className="code">config_split.js</span>中；</li>
                    <li style={{ color: 'green' }}>碎片内容还会写入<span className="code">config.js</span>的 allData 里；</li>
                    <li>依旧会生成一份代码，但是为了不影响原文件，所以代码被放置在原文件根目录的<span className="code">__tmp_split__</span>文件夹里，按需查用。</li>
                </ol>
            </StyledFinishBySave>
        );
    }
}


function mapStateToProps(state) {
    const { env } = state;
    return { env }
}

export default connect(mapStateToProps)(FinishBySave)

import React from 'react';
import * as monaco from 'monaco-editor'



const EditorContainer = (props) => {
  return <div
          id="editor-container"
          style={{width:"700px"

          }}></div>
};

const ErrorContainer = (props) => {
  if (props.errors.length === 0) {
    return (
      <div  style={{background: "#bcfbb8"}}>
        The above settings object is VALID
        </div>
    )
  } else {
    return (
    <div style={{background: "#fbb8b8"}}>
      The above settings object contains the following errors:
      {props.errors.map(error => <li>{error}</li>)}
    </div>)
  }


};



class MonacoWindow extends React.Component {

  state = {
    "errors": []
  }



  componentDidMount() {
    let url =
      "https://raw.githubusercontent.com/moj-analytical-services/splink/master/splink/files/settings_jsonschema.json"

    let p1 = fetch(url).then(res => res.json())

    p1.then(data => {

      let my_schema = data
      let text_value = this.props.editor_contents_string

      this.monaco = monaco

      var modelUri = this.monaco.Uri.parse("a://b/foo.json") // a made up unique URI for our model
      var model = this.monaco.editor.createModel(text_value, "json", modelUri)

      this.monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
          {
            uri: url, // id of the first schema
            fileMatch: [modelUri.toString()], // associate with our model
            schema: my_schema
          },
        ],
      })

      this.editor = this.monaco.editor.create(
        document.getElementById("editor-container"),
        {
          value: text_value,
          automaticLayout: false,
          language: "json",
          model: model,
          wordWrap: 'on',
          scrollbar: {
            vertical: "hidden",
            handleMouseWheel: false
          },
          scrollBeyondLastLine: false,
          minimap: {
            enabled: false
          },
          theme:"vs-dark",
          insertSpaces: true
        }
      )

      this.model = model

      this.editor.onDidChangeModelDecorations(() => {

        const model = this.editor.getModel();
        this.updateEditorHeight()

        const owner = model.getModeId();
        const markers = monaco.editor.getModelMarkers({ owner });


        let errors = []
        markers.forEach(d => {
          let mes = d.message
          let line = d.startLineNumber
           mes = `Error: ${mes} at line ${line}`
          errors.push(mes)
        })

        this.setState({"errors": errors})

      });


    })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.option_selection !== this.props.option_selection) {
      this.editor.setValue(this.props.editor_contents_string)
    }

  }

  prevHeight = 0

  updateEditorHeight = () => {
    const editorElement = this.editor.getDomNode()

    if (!editorElement) {
      return
    }

    const lineHeight = this.editor.getOption(monaco.editor.EditorOption.lineHeight)
    const lineCount = this.editor.getModel()?.getLineCount() || 1
    const height = this.editor.getTopForLineNumber(lineCount + 1) + lineHeight

    if (this.prevHeight !== height) {
      this.prevHeight = height
      editorElement.style.height = `${height}px`
      this.editor.layout()
    }
  }

  render() {
    return (
      <div>
        <p>You can use ctrl+space to autocomplete fields, and ctrl+shift+f to format the document</p>
	      <p>Hover over fields to get a description of their purpose</p>
        <EditorContainer className="monaco-window" />
        <ErrorContainer errors={this.state.errors}/>
      </div>
    )
  }
}

export default MonacoWindow
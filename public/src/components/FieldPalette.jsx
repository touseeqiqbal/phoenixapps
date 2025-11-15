import { useDrag } from 'react-dnd'
import { 
  Type, Mail, Hash, FileText, ChevronDown, 
  Radio, CheckSquare, Calendar, Upload, Star 
} from 'lucide-react'
import '../styles/FieldPalette.css'

const FIELD_TYPES = [
  { type: 'text', label: 'Text Input', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'textarea', label: 'Text Area', icon: FileText },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown },
  { type: 'radio', label: 'Radio Buttons', icon: Radio },
  { type: 'checkbox', label: 'Checkboxes', icon: CheckSquare },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'file', label: 'File Upload', icon: Upload },
  { type: 'rating', label: 'Rating', icon: Star },
]

function DraggableField({ fieldType, label, Icon }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'field',
    item: { fieldType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  return (
    <div
      ref={drag}
      className={`field-palette-item ${isDragging ? 'dragging' : ''}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </div>
  )
}

export default function FieldPalette({ onAddField }) {
  return (
    <div className="field-palette">
      <h3>Fields</h3>
      <div className="field-palette-list">
        {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
          <div key={type} onClick={() => onAddField(type)}>
            <DraggableField fieldType={type} label={label} Icon={Icon} />
          </div>
        ))}
      </div>
    </div>
  )
}

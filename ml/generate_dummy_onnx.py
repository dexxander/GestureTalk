import onnx
from onnx import helper
from onnx import TensorProto
import numpy as np

def generate_dummy_model():
    print("Generating dummy ONNX model...")
    # Define input
    X = helper.make_tensor_value_info('X', TensorProto.FLOAT, [1, 30, 153])
    
    # Define output
    Y = helper.make_tensor_value_info('Y', TensorProto.FLOAT, [1, 28])
    
    # Define a Constant tensor for the output
    # We'll make it always predict class 0 ('A') with a high logit so confidence is high
    Y_val = np.zeros((1, 28), dtype=np.float32)
    Y_val[0, 0] = 5.0  # Logit for class 0
    Y_tensor = helper.make_tensor('Y_const', TensorProto.FLOAT, [1, 28], Y_val.tobytes(), raw=True)
    
    # Create a Constant node that ignores the input and outputs Y_val
    node = helper.make_node(
        'Constant',
        inputs=[],
        outputs=['Y'],
        value=Y_tensor
    )
    
    # Create graph
    graph = helper.make_graph(
        [node],
        'dummy_transformer',
        [X],
        [Y]
    )
    
    # Create model
    model = helper.make_model(graph, producer_name='GestureTalk-Dummy')
    
    # Save model
    onnx.save(model, '../public/model/transformer.onnx')
    print("Saved dummy ONNX model to ../public/model/transformer.onnx")

if __name__ == '__main__':
    generate_dummy_model()

let hitTestCanvas;

type CanvasWorkerMessageType = 'setup' | 'hit' | 'draw';

interface CanvasWorkerMessageSetup {
	type: 'setup';
	body: {
		canvas: OffscreenCanvas;
	};
}
interface CanvasWorkerMessageHit {
	type: 'hit';
	body: {
		x: OffscreenCanvas;
	};
}
interface CanvasWorkerMessageDraw {
	type: 'draw';
	body: {
		canvas: OffscreenCanvas;
	};
}

type CanvasWorkerMessage =
	| CanvasWorkerMessageSetup
	| CanvasWorkerMessageHit
	| CanvasWorkerMessageDraw;

self.addEventListener(
	'message',
	(e: MessageEvent<CanvasWorkerMessage>) => {
		const { type, body } = e.data;
		switch (type) {
			case 'setup':
				
				break;
			case 'hit':
				break;
			case 'draw':
				break;
		}
	}
);

